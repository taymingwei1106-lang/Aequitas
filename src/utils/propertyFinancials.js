/*
 * Single source of truth for core property figures.
 *
 * Every screen that shows a property's monthly cashflow, current value or
 * current loan should read it from here, so the same property never shows
 * two different numbers in two places.
 *
 * Data compatibility:
 * - Accepts the stored property object exactly as it is saved today
 *   (string or number amounts, legacy expense fields, or monthlyExpenseItems).
 * - Never writes to storage.
 */

export const LEGACY_EXPENSE_FIELDS = [
  "maintenanceFee",
  "insurance",
  "quitRent",
  "assessmentTax",
  "managementFee",
  "otherExpenses",
  "sinkingFund",
];

/*
 * Returns a number, or null when the value was never entered.
 * "" / null / undefined / non-numeric -> null (missing, not zero).
 */
export function toAmount(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

/* Returns a number, treating a missing value as 0. */
export function amount(value) {
  return toAmount(value) ?? 0;
}

/*
 * Recurring monthly operating expenses (excluding the loan instalment).
 * Uses itemised expenses when the property has them, otherwise the legacy
 * per-type fields written by earlier versions of the wizard.
 */
export function getMonthlyExpenses(property = {}) {
  const items = property?.monthlyExpenseItems;

  if (Array.isArray(items) && items.length > 0) {
    return items.reduce((sum, item) => sum + amount(item?.amount), 0);
  }

  return LEGACY_EXPENSE_FIELDS.reduce(
    (sum, field) => sum + amount(property?.[field]),
    0
  );
}

/*
 * The one monthly cashflow definition used across Aequitas:
 *
 *   rental + other income − loan instalment − recurring expenses
 */
export function getMonthlyCashflow(property = {}) {
  const rental = amount(property?.monthlyRental);
  const otherIncome = amount(property?.monthlyOtherIncome);
  const instalment = amount(property?.monthlyInstalment);
  const expenses = getMonthlyExpenses(property);

  return {
    rental,
    otherIncome,
    income: rental + otherIncome,
    instalment,
    expenses,
    outgoings: instalment + expenses,
    cashflow: rental + otherIncome - instalment - expenses,
  };
}

/*
 * Current value of the property.
 * Uses the recorded market value when there is one; otherwise falls back to
 * the purchase price and says so, so the screen can label it honestly.
 */
export function getCurrentValue(property = {}) {
  const market = toAmount(property?.marketValue);

  if (market !== null && market > 0) {
    return { value: market, source: "market" };
  }

  const purchase = toAmount(property?.purchasePrice);

  if (purchase !== null && purchase > 0) {
    return { value: purchase, source: "purchase" };
  }

  return { value: 0, source: "none" };
}

/* Check-in amount that was actually entered (not left blank). */
export function checkinAmount(checkin, field) {
  return toAmount(checkin?.[field]);
}

/* Monthly cashflow recorded in a check-in. Blank fields count as 0. */
export function getCheckinCashflow(checkin = {}) {
  return (
    amount(checkin.rentalReceived) -
    amount(checkin.loanInstalment) -
    amount(checkin.maintenancePaid) -
    amount(checkin.otherExpenses)
  );
}

/*
 * Compares the property record with its most recent check-in that has a
 * value for the field. Used to surface (not silently fix) mismatches.
 */
export function findRecordMismatch(property, checkins, field, recordField) {
  const sorted = [...(checkins || [])]
    .filter((item) => item?.month && checkinAmount(item, field) !== null)
    .sort((a, b) => String(b.month).localeCompare(String(a.month)));

  const latest = sorted[0];
  if (!latest) return null;

  const checkinValue = checkinAmount(latest, field);
  const recordValue = toAmount(property?.[recordField]);

  if (recordValue !== null && Math.abs(checkinValue - recordValue) < 0.5) {
    return null;
  }

  return {
    field: recordField,
    month: latest.month,
    checkinValue,
    recordValue,
  };
}

export function formatMonth(month) {
  if (!month) return "";
  const [year, monthNumber] = String(month).split("-");
  return new Date(Number(year), Number(monthNumber) - 1, 1).toLocaleDateString(
    "en-MY",
    { month: "long", year: "numeric" }
  );
}

export function formatRM(value, maxDecimals = 0) {
  const number = Number(value) || 0;
  // Show cents only when the amount actually has them.
  const decimals = Number.isInteger(Math.round(number * 100) / 100) ? 0 : maxDecimals;
  const sign = number < 0 ? "-" : "";
  return `${sign}RM ${Math.abs(number).toLocaleString("en-MY", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
