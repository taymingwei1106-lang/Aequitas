import { getMonthlyCheckins } from "../services/monthlyCheckinStorage";
import { calculatePerformanceIntelligence } from "./PerformanceIntelligenceEngine";
import { analyseLoan } from "./loanEngine";
import {
  amount,
  formatMonth,
  formatRM,
  getCurrentValue,
  getMonthlyCashflow,
} from "./propertyFinancials";

/*
 * Aequitas assessment
 *
 * Replaces the numeric health / risk / portfolio scores with a status and
 * the reasons for it. Each area is judged by a stated rule, so the
 * investor can see exactly why a property is "On track", "Watch" or
 * "Needs review".
 *
 * Status comes only from the investment's financial condition.
 * Data that needs confirming (missing valuation, a loan balance that
 * doesn't fit) is listed separately under "To confirm": it lowers
 * confidence, not the status.
 */

export const STATUS = {
  ok: { rank: 0, label: "On track", tone: "positive" },
  watch: { rank: 1, label: "Watch", tone: "caution" },
  review: { rank: 2, label: "Needs review", tone: "negative" },
  unknown: { rank: -1, label: "Not enough data", tone: "neutral" },
};

export const RULES = [
  "Cashflow: needs review below RM 0 a month; watch when positive but under 5% of income.",
  "Leverage (loan ÷ value): needs review above 100%; watch from 90%.",
  "Repayment: needs review if the instalment does not cover the monthly interest (only when an interest rate is recorded).",
  "The overall status is the most serious of these. Items under \"To confirm\" do not change it.",
];

const THIN = 0.05;

function worst(areas) {
  return areas.reduce(
    (current, area) =>
      STATUS[area.status].rank > STATUS[current].rank ? area.status : current,
    areas.some((area) => area.status !== "unknown") ? "ok" : "unknown"
  );
}

function previousMonth(today) {
  const d = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function assessProperty(property, today = new Date()) {
  const name = property?.projectName || "Unnamed property";
  const checkins = getMonthlyCheckins(property?.id);
  const flow = getMonthlyCashflow(property);
  const value = getCurrentValue(property);
  const loanBalance = amount(property?.outstandingLoan);
  const loan = analyseLoan(property, checkins, today);
  const performance = calculatePerformanceIntelligence(property);

  const areas = [];
  const toConfirm = [];

  /* Cashflow */
  if (flow.income <= 0) {
    areas.push({
      key: "cashflow",
      title: "Cashflow",
      status: "unknown",
      short: "no income recorded",
      text: "No rental income is recorded.",
    });
  } else {
    const margin = flow.cashflow / flow.income;
    if (flow.cashflow < 0) {
      areas.push({
        key: "cashflow",
        title: "Cashflow",
        status: "review",
        short: "monthly loss",
        text: `Running at a loss of about ${formatRM(
          Math.abs(flow.cashflow)
        )} a month.`,
      });
    } else if (margin < THIN) {
      areas.push({
        key: "cashflow",
        title: "Cashflow",
        status: "watch",
        short: "thin cashflow",
        text: `Positive but thin: about ${formatRM(flow.cashflow)} a month (${(
          margin * 100
        ).toFixed(1)}% of income).`,
      });
    } else {
      areas.push({
        key: "cashflow",
        title: "Cashflow",
        status: "ok",
        short: "positive cashflow",
        text: `Positive: about ${formatRM(flow.cashflow)} a month (${(
          margin * 100
        ).toFixed(1)}% of income).`,
      });
    }
  }

  /* Leverage */
  if (value.value > 0) {
    const ltv = loanBalance / value.value;
    const basis =
      value.source === "market" ? "market value" : "purchase price";
    const pct = `${(ltv * 100).toFixed(0)}%`;

    if (ltv > 1) {
      areas.push({
        key: "leverage",
        title: "Leverage",
        status: "review",
        short: "loan above value",
        text: `The loan is ${pct} of the ${basis}: it exceeds the property's value.`,
      });
    } else if (ltv >= 0.9) {
      areas.push({
        key: "leverage",
        title: "Leverage",
        status: "watch",
        short: "high leverage",
        text: `The loan is ${pct} of the ${basis}, leaving a thin equity cushion of about ${formatRM(
          value.value - loanBalance
        )}.`,
      });
    } else {
      areas.push({
        key: "leverage",
        title: "Leverage",
        status: "ok",
        short: "leverage",
        text: `The loan is ${pct} of the ${basis}.`,
      });
    }
  }

  /* Repayment (only with an interest rate) */
  if (loan.ready) {
    if (!loan.repaying) {
      areas.push({
        key: "repayment",
        title: "Repayment",
        status: "review",
        short: "instalment below interest",
        text: `At ${loan.rate}% the monthly interest (about ${formatRM(
          loan.interest
        )}) is more than the instalment, so the loan is not being repaid.`,
      });
    } else {
      areas.push({
        key: "repayment",
        title: "Repayment",
        status: "ok",
        short: "repaying",
        text: `About ${formatRM(loan.principal)} of each ${formatRM(
          loan.instalment
        )} instalment reduces the loan; ${formatRM(
          loan.interest
        )} is interest.`,
      });
    }
  }

  /*
   * To confirm (data confidence): contradictions in recorded data.
   * Missing optional details (valuation, interest rate, etc.) are listed by
   * "Complete this property" instead.
   */

  const flags = performance.dataFlags || [];
  const rose = flags.filter((f) => f.type === "loan-increase");
  const unchanged = flags.filter((f) => f.type === "loan-unchanged");

  rose.forEach((f) => {
    toConfirm.push({
      key: `rose-${f.toMonth}`,
      text: `Loan balance rose by ${formatRM(f.change, 2)} from ${formatMonth(
        f.fromMonth
      )} to ${formatMonth(f.toMonth)}. Check it against your loan statement.`,
    });
  });

  unchanged.forEach((f) => {
    toConfirm.push({
      key: `same-${f.fromMonth}`,
      text: `Loan balance recorded as exactly ${formatRM(f.value, 2)} for ${
        f.months
      } months (${formatMonth(f.fromMonth)} to ${formatMonth(
        f.toMonth
      )}), which suggests it was carried forward.`,
    });
  });

  if (loan.ready) {
    loan.review
      .filter((r) => r.status === "higher" || r.status === "lower")
      .filter((r) => !rose.some((f) => f.toMonth === r.month))
      .forEach((r) => {
        toConfirm.push({
          key: `fit-${r.month}`,
          text: `${formatMonth(r.month)} loan balance (${formatRM(
            r.actual,
            2
          )}) is ${formatRM(Math.abs(r.difference))} ${
            r.status === "higher" ? "above" : "below"
          } what ${loan.rate}% interest would produce (about ${formatRM(
            r.expected
          )}).`,
        });
      });
  }

  const latestMonth = checkins[0]?.month;
  if (!latestMonth) {
    toConfirm.push({
      key: "checkins",
      text: "No monthly check-ins recorded yet.",
    });
  } else if (latestMonth < previousMonth(today)) {
    toConfirm.push({
      key: "checkins",
      text: `Check-ins are behind: the latest is for ${formatMonth(
        latestMonth
      )}.`,
    });
  }

  const status = worst(areas);

  return {
    id: property?.id,
    name,
    status,
    statusMeta: STATUS[status],
    areas,
    concerns: areas.filter((a) => a.status === "watch" || a.status === "review"),
    toConfirm,
    figures: {
      cashflow: flow.cashflow,
      income: flow.income,
      value: value.value,
      valueSource: value.source,
      loan: loanBalance,
      equity: value.value - loanBalance,
      ltv: value.value > 0 ? loanBalance / value.value : null,
      grossYield:
        amount(property?.purchasePrice) > 0
          ? ((flow.rental * 12) / amount(property.purchasePrice)) * 100
          : null,
    },
    loan,
  };
}

export function assessPortfolio(properties = [], today = new Date()) {
  const assessments = properties.map((p) => assessProperty(p, today));
  const status = assessments.length
    ? assessments.reduce(
        (current, a) =>
          STATUS[a.status].rank > STATUS[current].rank ? a.status : current,
        "ok"
      )
    : "unknown";

  const flagged = assessments.filter(
    (a) => a.status === "watch" || a.status === "review"
  );

  let message;
  if (!assessments.length) {
    message = "Add your first property to start tracking your portfolio.";
  } else if (!flagged.length) {
    message =
      assessments.length === 1
        ? `${assessments[0].name} is on track on cashflow and leverage.`
        : `All ${assessments.length} properties are on track on cashflow and leverage.`;
  } else {
    message = flagged
      .map(
        (a) =>
          `${a.name}: ${a.concerns.map((c) => c.short).join(" and ")}.`
      )
      .join(" ");
  }

  return {
    status,
    statusMeta: STATUS[status],
    message,
    assessments,
    flaggedCount: flagged.length,
  };
}
