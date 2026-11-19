import {
  amount,
  formatMonth,
  formatRM,
  getCurrentValue,
  getMonthlyCashflow,
} from "./propertyFinancials";
import { analyseLoan } from "./loanEngine";
import { calculateAcquisition } from "./acquisitionEngine";

/*
 * Aequitas Advisor
 *
 * Interprets a property's current figures and recorded history into:
 *   1. What is happening
 *   2. Why Aequitas reached this interpretation (the evidence)
 *   3. What deserves attention
 *   4. What to monitor next
 *
 * It explains; it does not recommend buying, selling or refinancing.
 * Every statement is derived from recorded figures, and the inputs used
 * are returned so the screen can show them.
 */

const THIN_BUFFER = 0.05; // cashflow below 5% of income

function nextMonth(month) {
  if (!month) return null;
  const [year, m] = String(month).split("-").map(Number);
  const date = new Date(year, m, 1); // m is already +1 (0-based next month)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function buildAdvisorReport(property, performance, checkins = []) {
  const name = property?.projectName || "This property";
  const flow = getMonthlyCashflow(property);
  const value = getCurrentValue(property);
  const loan = amount(property?.outstandingLoan);
  const equity = value.value - loan;
  const cf = flow.cashflow;
  const margin = flow.income > 0 ? cf / flow.income : null;
  const loanAnalysis = analyseLoan(property, checkins);

  const happening = [];
  const attention = [];
  const monitor = [];

  /* ---------- 1. What is happening ---------- */

  let status;

  if (flow.income <= 0) {
    status = { tone: "neutral", label: "No income recorded" };
    happening.push(
      `No rental income is recorded for ${name}, so Aequitas cannot assess its monthly result yet.`
    );
  } else if (cf >= 0) {
    status = { tone: "positive", label: "Covering its costs" };
    happening.push(
      `${name} is covering its costs with about ${formatRM(cf)} a month to spare: ` +
        `income of ${formatRM(flow.income)} against a ${formatRM(flow.instalment)} instalment ` +
        `and ${formatRM(flow.expenses)} of recurring expenses.`
    );
  } else {
    status = { tone: "negative", label: "Running at a monthly loss" };
    happening.push(
      `${name} costs about ${formatRM(Math.abs(cf))} a month more than it brings in: ` +
        `income of ${formatRM(flow.income)} against a ${formatRM(flow.instalment)} instalment ` +
        `and ${formatRM(flow.expenses)} of recurring expenses.`
    );
  }

  if (flow.income > 0) {
    if (cf < 0) {
      happening.push(
        `Rent would need to be about ${formatRM(flow.outgoings - flow.otherIncome)} ` +
          `(${formatRM(Math.abs(cf))} more) for the property to break even each month.`
      );
    } else if (margin < THIN_BUFFER) {
      const monthsToRecoverVacancy =
        cf > 0 ? Math.round(flow.outgoings / cf) : null;

      happening.push(
        `That buffer is thin, at ${(margin * 100).toFixed(1)}% of income. ` +
          `A rent reduction or unplanned cost above ${formatRM(cf)} would turn the month negative. ` +
          `A vacant month would cost about ${formatRM(flow.outgoings)}` +
          (monthsToRecoverVacancy
            ? `, roughly ${monthsToRecoverVacancy} months of the current surplus.`
            : ".")
      );
    } else {
      happening.push(
        `The buffer is ${(margin * 100).toFixed(1)}% of income. ` +
          `A vacant month would cost about ${formatRM(flow.outgoings)}.`
      );
    }
  }

  if (performance?.available) {
    let trend = performance.summary.interpretation;

    (performance.oneOffs || []).forEach((m) => {
      trend += ` ${formatMonth(m.month)} included a one-off ${formatRM(
        m.otherExpenses
      )} expense${m.note ? ` ("${m.note}")` : ""}.`;
    });

    if (
      performance.middleOutlier &&
      !(performance.oneOffs || []).some(
        (m) => m.month === performance.middleOutlier
      )
    ) {
      trend += ` ${formatMonth(
        performance.middleOutlier
      )} stood out from the months either side of it.`;
    }

    happening.push(trend);
  } else {
    const count = performance?.monthsTracked ?? 0;
    happening.push(
      count === 0
        ? "No monthly check-ins are recorded yet, so this reading is based only on the property's expected figures."
        : `${count} monthly check-in${count === 1 ? " is" : "s are"} recorded. ` +
            "Trend analysis starts once three months are recorded."
    );
  }

  if (value.source === "market") {
    happening.push(
      `Estimated equity is ${formatRM(equity)}, based on a market value of ` +
        `${formatRM(value.value)} and an outstanding loan of ${formatRM(loan, 2)}.`
    );
  } else if (value.source === "purchase") {
    happening.push(
      `No market valuation is recorded, so equity can only be estimated against the purchase price: ` +
        `${formatRM(value.value)} less the ${formatRM(loan, 2)} loan leaves about ${formatRM(equity)}. ` +
        "This is not a market-based figure."
    );
  }

  const acquisition = calculateAcquisition(property);

  if (acquisition.netCashInvested !== null) {
    if (acquisition.netCashInvested <= 0) {
      happening.push(
        `After the loan and cashback, none of your own money remains in ${name}: you received about ` +
          `${formatRM(Math.abs(acquisition.netCashInvested))} more back than you put in. ` +
          "Its result therefore depends on the rent continuing to cover the loan."
      );
    } else if (acquisition.cashOnCash !== null) {
      happening.push(
        `Your net cash in the property is about ${formatRM(acquisition.netCashInvested)}. ` +
          `At the current cashflow that earns ${acquisition.cashOnCash.toFixed(1)}% a year, before any change in value.`
      );
    }
  }

  /* ---------- 3. What deserves attention ---------- */

  if (flow.income > 0 && cf < 0) {
    attention.push({
      title: "Monthly shortfall",
      detail: `The property needs about ${formatRM(
        Math.abs(cf)
      )} a month from elsewhere to cover its costs.`,
    });
  }

  const flags = performance?.dataFlags || [];

  flags
    .filter((f) => f.type === "loan-increase")
    .forEach((f) => {
      attention.push({
        title: "Loan balance went up",
        detail:
          `The recorded loan balance rose from ${formatRM(f.from, 2)} (${formatMonth(
            f.fromMonth
          )}) to ${formatRM(f.to, 2)} (${formatMonth(f.toMonth)}), ` +
          `an increase of ${formatRM(f.change, 2)}. Balances normally fall as instalments are paid. ` +
          "Check this figure against your loan statement; it may be a typing error, or charges added to the loan." +
          (() => {
            const row = loanAnalysis.ready
              ? loanAnalysis.review.find((r) => r.month === f.toMonth)
              : null;
            return row
              ? ` At ${loanAnalysis.rate}% interest, the expected ${formatMonth(
                  f.toMonth
                )} balance was about ${formatRM(row.expected)}.`
              : "";
          })(),
      });
    });

  /*
   * A difference between the property record and the latest check-in is
   * shown once, as a notice at the top of the property page, so it is not
   * repeated here.
   */

  flags
    .filter((f) => f.type === "loan-unchanged")
    .forEach((f) => {
      attention.push({
        title: "Loan balance not changing",
        detail:
          `The loan balance was recorded as exactly ${formatRM(f.value, 2)} for ${
            f.months
          } months (${formatMonth(f.fromMonth)} to ${formatMonth(f.toMonth)}) ` +
          "while instalments were being paid. This usually means the figure was carried forward rather than taken from a statement.",
      });
    });

  if (value.source !== "market") {
    attention.push({
      title: "No market valuation",
      detail:
        "Without a recorded market value, Aequitas cannot measure capital growth or true equity.",
    });
  }

  /* ---------- 4. What to monitor next ---------- */

  const latestMonth = performance?.checkins?.[0]?.month || checkins?.[0]?.month;
  const upcoming = latestMonth ? nextMonth(latestMonth) : currentMonth();

  const loanNeedsChecking = flags.some(
    (f) => f.type === "loan-increase" || f.type === "loan-unchanged"
  );

  monitor.push(
    `Record the ${formatMonth(upcoming)} check-in` +
      (loanNeedsChecking
        ? ", taking the outstanding loan from your latest loan statement"
        : "") +
      (loanAnalysis.ready && loanAnalysis.nextExpected.month === upcoming
        ? `. If the instalment is paid as usual, expect a balance of about ${formatRM(
            loanAnalysis.nextExpected.balance
          )}.`
        : ".")
  );

  if (!loanAnalysis.hasRate) {
    monitor.push(
      "Add the loan's interest rate (Edit Property → Financing) so Aequitas can check each recorded balance."
    );
  }

  if (flow.income > 0 && cf >= 0 && margin < THIN_BUFFER) {
    monitor.push(
      "Watch rent collection and one-off costs; at this buffer, a single expense can decide whether the month is positive."
    );
  } else if (cf < 0) {
    monitor.push(
      "Watch whether the monthly shortfall narrows or widens over the next three check-ins."
    );
  }

  if (value.source !== "market") {
    monitor.push(
      "Add a market value when you have a reliable reference, such as a bank valuation."
    );
  }

  /* ---------- 2. Why (evidence) ---------- */

  const why = {
    basis: [
      `Expected monthly figures from the property record: income ${formatRM(
        flow.income
      )}, instalment ${formatRM(flow.instalment)}, recurring expenses ${formatRM(
        flow.expenses,
        2
      )}.`,
      performance?.available
        ? `Recorded check-ins for ${performance.months
            .map((m) => formatMonth(m.month))
            .join(", ")}. Movements of ${formatRM(
            performance.threshold
          )} or less are treated as stable.`
        : "Fewer than three check-ins, so no trend has been assessed.",
      value.source === "market"
        ? "Market value from the property record."
        : "Purchase price used in place of a market value.",
    ],
    months: performance?.available ? performance.months : [],
  };

  return {
    status,
    happening,
    why,
    attention: attention.slice(0, 5),
    monitor: monitor.slice(0, 3),
    snapshot: {
      cashflow: cf,
      income: flow.income,
      outgoings: flow.outgoings,
      equity,
      valueSource: value.source,
    },
  };
}
