import { getMonthlyCheckins } from "../services/monthlyCheckinStorage";

const n = (value) => Number(value) || 0;

const cashflow = (item) =>
  n(item?.rentalReceived) -
  n(item?.loanInstalment) -
  n(item?.maintenancePaid) -
  n(item?.otherExpenses);

const direction = (change, positiveWhen) => {
  if (Math.abs(change) < 0.01) return "stable";
  return positiveWhen(change) ? "improving" : "weakening";
};

export function calculatePerformanceIntelligence(property) {
  if (!property?.id) {
    return {
      available: false,
      checkins: [],
      monthsTracked: 0,
      overallTrend: "insufficient-data",
      summary: null,
    };
  }

  const checkins = getMonthlyCheckins(property.id).slice(0, 3);

  if (checkins.length < 3) {
    return {
      available: false,
      checkins,
      monthsTracked: checkins.length,
      overallTrend: "insufficient-data",
      summary: null,
    };
  }

  const latest = checkins[0];
  const middle = checkins[1];
  const oldest = checkins[2];

  const latestCashflow = cashflow(latest);
  const middleCashflow = cashflow(middle);
  const oldestCashflow = cashflow(oldest);

  const cashflowChange = latestCashflow - oldestCashflow;
  const rentalChange = n(latest.rentalReceived) - n(oldest.rentalReceived);
  const loanChange = n(latest.outstandingLoan) - n(oldest.outstandingLoan);

  const expenseChange =
    n(latest.maintenancePaid) +
    n(latest.otherExpenses) -
    n(oldest.maintenancePaid) -
    n(oldest.otherExpenses);

  const marketValueChange =
    n(latest.marketValue) - n(oldest.marketValue);

  const cashflowDirection = direction(cashflowChange, (x) => x > 0);
  const rentalDirection = direction(rentalChange, (x) => x > 0);
  const loanDirection = direction(loanChange, (x) => x < 0);
  const expenseDirection = direction(expenseChange, (x) => x < 0);
  const marketValueDirection = direction(marketValueChange, (x) => x > 0);

  const improving = [
    cashflowDirection,
    rentalDirection,
    loanDirection,
    expenseDirection,
    marketValueDirection,
  ].filter((x) => x === "improving").length;

  const weakening = [
    cashflowDirection,
    rentalDirection,
    loanDirection,
    expenseDirection,
    marketValueDirection,
  ].filter((x) => x === "weakening").length;

  let overallTrend = "stable";
  if (improving >= 3 && improving > weakening) overallTrend = "improving";
  if (weakening >= 3 && weakening > improving) overallTrend = "weakening";

  let interpretation =
    overallTrend === "improving"
      ? "The investment is showing an improving operating position across the latest three recorded months."
      : overallTrend === "weakening"
      ? "The investment is showing signs of weaker performance across the latest three recorded months and deserves closer review."
      : "The investment has remained broadly stable across the latest three recorded months, with no clear overall direction yet.";

  const rentalStable =
    Math.abs(rentalChange) <
    Math.max(50, n(oldest.rentalReceived) * 0.05);

  if (latestCashflow > oldestCashflow && rentalStable) {
    interpretation +=
      " Cashflow has improved without a major change in rental income, suggesting that expense or financing movements are contributing to the improvement.";
  }

  return {
    available: true,
    checkins,
    monthsTracked: 3,
    oldest,
    middle,
    latest,
    overallTrend,
    summary: {
      latestCashflow,
      middleCashflow,
      oldestCashflow,
      cashflowChange,
      rentalChange,
      loanChange,
      expenseChange,
      marketValueChange,
      cashflowDirection,
      rentalDirection,
      loanDirection,
      expenseDirection,
      marketValueDirection,
      interpretation,
    },
  };
}
