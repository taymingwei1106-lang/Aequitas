import { getMonthlyCheckins } from "../services/monthlyCheckinStorage";
import {
  amount,
  checkinAmount,
  getCheckinCashflow,
} from "./propertyFinancials";

/*
 * Performance Intelligence
 *
 * Reviews the three latest recorded check-ins.
 *
 * Design rules:
 * - Operating result (cashflow and what drives it) is kept separate from
 *   position (loan balance and market value). They answer different
 *   questions and are not mixed into one vote.
 * - A blank field means "not recorded", never zero.
 * - Small movements are treated as stable (materiality threshold), so a
 *   single RM50 item does not flip the trend.
 * - All three months are reported, not just the first and last, so a
 *   one-off spike in the middle is visible.
 *
 * Accepts a property object (preferred) or a property id.
 */

const HISTORY_MONTHS = 3;

function materiality(rent) {
  return Math.max(50, Math.abs(rent) * 0.02);
}

function classify(change, threshold, positiveWhenUp = true) {
  if (change === null) return "unknown";
  if (Math.abs(change) <= threshold) return "stable";
  const up = change > 0;
  return up === positiveWhenUp ? "improving" : "weakening";
}

function monthSummary(item) {
  return {
    month: item.month,
    rental: amount(item.rentalReceived),
    instalment: amount(item.loanInstalment),
    maintenance: amount(item.maintenancePaid),
    otherExpenses: amount(item.otherExpenses),
    expenses: amount(item.maintenancePaid) + amount(item.otherExpenses),
    cashflow: getCheckinCashflow(item),
    loan: checkinAmount(item, "outstandingLoan"),
    marketValue: checkinAmount(item, "marketValue"),
    note: item.note || "",
  };
}

function changeBetween(latestValue, oldestValue) {
  if (latestValue === null || oldestValue === null) return null;
  return latestValue - oldestValue;
}

/*
 * Data-quality signals across the full history (not just three months).
 */
function detectDataFlags(allCheckins) {
  const flags = [];
  const ascending = [...allCheckins]
    .filter((item) => checkinAmount(item, "outstandingLoan") !== null)
    .sort((a, b) => String(a.month).localeCompare(String(b.month)));

  // Loan balance rising between consecutive records.
  for (let i = 1; i < ascending.length; i += 1) {
    const before = checkinAmount(ascending[i - 1], "outstandingLoan");
    const after = checkinAmount(ascending[i], "outstandingLoan");

    if (after - before > 1) {
      flags.push({
        type: "loan-increase",
        fromMonth: ascending[i - 1].month,
        toMonth: ascending[i].month,
        from: before,
        to: after,
        change: after - before,
      });
    }
  }

  // Loan balance identical for 3+ consecutive records while instalments
  // were being paid — usually means the figure was carried forward.
  let runStart = 0;
  for (let i = 1; i <= ascending.length; i += 1) {
    const same =
      i < ascending.length &&
      Math.abs(
        checkinAmount(ascending[i], "outstandingLoan") -
          checkinAmount(ascending[runStart], "outstandingLoan")
      ) < 0.5;

    if (!same) {
      const length = i - runStart;
      const paid = ascending
        .slice(runStart, i)
        .some((item) => amount(item.loanInstalment) > 0);

      if (length >= 3 && paid) {
        flags.push({
          type: "loan-unchanged",
          fromMonth: ascending[runStart].month,
          toMonth: ascending[i - 1].month,
          months: length,
          value: checkinAmount(ascending[runStart], "outstandingLoan"),
        });
      }
      runStart = i;
    }
  }

  const hasValuation = allCheckins.some(
    (item) => (checkinAmount(item, "marketValue") ?? 0) > 0
  );

  if (!hasValuation) {
    flags.push({ type: "no-valuation" });
  }

  return flags;
}

export function calculatePerformanceIntelligence(propertyOrId) {
  const id =
    propertyOrId && typeof propertyOrId === "object"
      ? propertyOrId.id
      : propertyOrId;

  const empty = {
    available: false,
    checkins: [],
    months: [],
    monthsTracked: 0,
    overallTrend: "insufficient-data",
    summary: null,
    dataFlags: [],
  };

  if (id === undefined || id === null || id === "") return empty;

  const allCheckins = getMonthlyCheckins(id).filter((item) => item?.month);
  const dataFlags = detectDataFlags(allCheckins);
  const recent = allCheckins.slice(0, HISTORY_MONTHS);

  if (recent.length < HISTORY_MONTHS) {
    return {
      ...empty,
      checkins: recent,
      months: recent.map(monthSummary),
      monthsTracked: allCheckins.length,
      dataFlags,
    };
  }

  // Oldest -> latest for display.
  const months = recent.map(monthSummary).reverse();
  const oldest = months[0];
  const middle = months[1];
  const latest = months[months.length - 1];

  const threshold = materiality(oldest.rental || latest.rental);

  const cashflowChange = latest.cashflow - oldest.cashflow;
  const rentalChange = latest.rental - oldest.rental;
  const instalmentChange = latest.instalment - oldest.instalment;
  const expenseChange = latest.expenses - oldest.expenses;
  const loanChange = changeBetween(latest.loan, oldest.loan);
  const marketValueChange = changeBetween(
    latest.marketValue,
    oldest.marketValue
  );

  const cashflowDirection = classify(cashflowChange, threshold, true);
  const rentalDirection = classify(rentalChange, threshold, true);
  const instalmentDirection = classify(instalmentChange, threshold, false);
  const expenseDirection = classify(expenseChange, threshold, false);

  const loanDirection =
    loanChange === null
      ? "unknown"
      : loanChange > 1
      ? "check"
      : loanChange < -1
      ? "improving"
      : "stable";

  const marketValueDirection = classify(
    marketValueChange,
    Math.max(1, Math.abs(oldest.marketValue || 0) * 0.01),
    true
  );

  /*
   * Middle-month outlier: the middle month differs from both ends by more
   * than the threshold in the same direction.
   */
  const middleGapToOldest = middle.cashflow - oldest.cashflow;
  const middleGapToLatest = middle.cashflow - latest.cashflow;
  const middleOutlier =
    Math.abs(middleGapToOldest) > threshold &&
    Math.abs(middleGapToLatest) > threshold &&
    Math.sign(middleGapToOldest) === Math.sign(middleGapToLatest)
      ? middle.month
      : null;

  /*
   * One-off expenses: "other expenses" recorded in only one of the months.
   */
  const oneOffs = months.filter(
    (m) =>
      m.otherExpenses > 0 &&
      months.filter((x) => x.otherExpenses > 0).length === 1
  );

  // Overall trend follows the operating result (cashflow).
  const overallTrend = cashflowDirection;

  const drivers = [];
  if (rentalDirection !== "stable") drivers.push("rent");
  if (instalmentDirection !== "stable") drivers.push("instalment");
  if (expenseDirection !== "stable") drivers.push("expenses");

  let interpretation;
  if (overallTrend === "improving") {
    interpretation =
      "Monthly cashflow improved across the three latest recorded months.";
  } else if (overallTrend === "weakening") {
    interpretation =
      "Monthly cashflow weakened across the three latest recorded months and deserves a closer look.";
  } else {
    interpretation =
      "Monthly cashflow was broadly stable across the three latest recorded months.";
  }

  if (overallTrend !== "stable" && drivers.length > 0) {
    interpretation += ` The movement came mainly from ${drivers.join(
      " and "
    )}.`;
  }

  return {
    available: true,
    checkins: recent,
    months,
    monthsTracked: allCheckins.length,
    oldest: recent[2],
    middle: recent[1],
    latest: recent[0],
    overallTrend,
    threshold,
    middleOutlier,
    oneOffs,
    dataFlags,
    summary: {
      latestCashflow: latest.cashflow,
      middleCashflow: middle.cashflow,
      oldestCashflow: oldest.cashflow,
      cashflowChange,
      rentalChange,
      instalmentChange,
      loanChange,
      expenseChange,
      marketValueChange,
      cashflowDirection,
      rentalDirection,
      instalmentDirection,
      loanDirection,
      expenseDirection,
      marketValueDirection,
      interpretation,
    },
  };
}
