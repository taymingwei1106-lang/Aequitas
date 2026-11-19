import { getMonthlyCheckins } from "../services/monthlyCheckinStorage";
import { getSettings } from "../services/settingsStorage";
import { getDocuments } from "./documents";
import { formatMonth, toAmount } from "./propertyFinancials";

/*
 * Data freshness
 *
 * Answers "when did I last update this, and is it due again?"
 *
 * Check-in status (one check-in per month, recorded once rent and the loan
 * statement for that month are in; the "check-in day" in Settings, default
 * the 7th, is when the current month's check-in becomes due):
 *   up-to-date  this month is recorded, or last month is recorded and the
 *               check-in day hasn't arrived yet
 *   due         last month is recorded, this month isn't, and the
 *               check-in day has passed
 *   overdue     nothing recorded for last month or later
 *   none        no check-ins at all
 *
 * Figure freshness: when the loan balance last actually changed (not
 * carried forward), how old the latest market value is, and when the
 * interest rate was last updated.
 */

const DAY = 86400000;

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function addMonths(key, n) {
  const [y, m] = key.split("-").map(Number);
  return monthKey(new Date(y, m - 1 + n, 1));
}

function dateOnly(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(from, to) {
  return Math.round((dateOnly(to) - dateOnly(from)) / DAY);
}

export function relativeDays(days) {
  if (days === null || days === undefined) return "";
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 45) return `${days} days ago`;
  const months = Math.round(days / 30.4);
  if (months < 18) return `${months} months ago`;
  return `${Math.round(days / 365)} years ago`;
}

export function formatDay(date) {
  return date.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
}

export function getFreshness(property, today = new Date(), settings = getSettings()) {
  const checkinDay = Math.min(28, Math.max(1, Number(settings.checkinDay) || 7));
  const checkins = getMonthlyCheckins(property?.id).filter((c) => c?.month);
  const latest = checkins[0] || null;

  const thisMonth = monthKey(today);
  const lastMonth = addMonths(thisMonth, -1);
  const pastCheckinDay = today.getDate() >= checkinDay;

  let status;
  let dueMonth = null;
  let nextDue;

  if (!latest) {
    status = "none";
    dueMonth = thisMonth;
  } else if (latest.month >= thisMonth) {
    status = "up-to-date";
  } else if (latest.month === lastMonth) {
    status = pastCheckinDay ? "due" : "up-to-date";
    if (pastCheckinDay) dueMonth = thisMonth;
  } else {
    status = "overdue";
    dueMonth = addMonths(latest.month, 1);
  }

  // When the next check-in becomes due.
  const nextMonthToRecord = latest && latest.month >= thisMonth ? addMonths(thisMonth, 1) : thisMonth;
  const [ny, nm] = nextMonthToRecord.split("-").map(Number);
  nextDue = new Date(ny, nm - 1, checkinDay);

  // Most recent time any check-in was entered or edited.
  const enteredAt = checkins.reduce((max, c) => {
    const d = new Date(c.updatedAt || c.createdAt || NaN);
    return !Number.isNaN(d.getTime()) && (!max || d > max) ? d : max;
  }, null);
  const enteredValid = Boolean(enteredAt);
  const daysSinceEntry = enteredValid ? daysBetween(enteredAt, today) : null;

  // Months entered together on one day (filled in afterwards).
  const byDay = {};
  checkins.forEach((c) => {
    const d = (c.createdAt || "").slice(0, 10);
    if (d) (byDay[d] = byDay[d] || []).push(c.month);
  });
  const batches = Object.entries(byDay)
    .filter(([, months]) => months.length >= 3)
    .map(([day, months]) => ({ day, months: months.sort() }));

  /* ---- figure freshness ---- */
  const ascending = [...checkins].sort((a, b) => a.month.localeCompare(b.month));

  let loanChangedMonth = null;
  let previousLoan = null;
  ascending.forEach((c) => {
    const value = toAmount(c.outstandingLoan);
    if (value === null) return;
    if (previousLoan === null || Math.abs(value - previousLoan) >= 0.5) loanChangedMonth = c.month;
    previousLoan = value;
  });
  const loanMonthsSinceChange = loanChangedMonth
    ? (() => {
        const [y1, m1] = loanChangedMonth.split("-").map(Number);
        const [y2, m2] = thisMonth.split("-").map(Number);
        return (y2 - y1) * 12 + (m2 - m1);
      })()
    : null;

  const valuationCheckin = [...ascending].reverse().find((c) => (toAmount(c.marketValue) ?? 0) > 0);
  const valuationDoc = getDocuments(property).valuation?.date || null;
  let valueDate = null;
  if (valuationCheckin) valueDate = new Date(`${valuationCheckin.month}-01T00:00:00`);
  if (valuationDoc) {
    const d = new Date(`${valuationDoc}T00:00:00`);
    if (!valueDate || d > valueDate) valueDate = d;
  }
  const hasValue = (toAmount(property?.marketValue) ?? 0) > 0 || Boolean(valuationCheckin);
  const valueAgeDays = valueDate ? daysBetween(valueDate, today) : null;

  const rateSet = (toAmount(property?.interestRate) ?? 0) > 0;
  const rateUpdated = property?.interestRateUpdatedAt ? new Date(property.interestRateUpdatedAt) : null;
  const rateAgeDays = rateUpdated && !Number.isNaN(rateUpdated.getTime()) ? daysBetween(rateUpdated, today) : null;

  const figures = [
    {
      key: "loan",
      label: "Loan balance",
      value: !loanChangedMonth
        ? "Not recorded in a check-in"
        : loanMonthsSinceChange <= 1
        ? `Updated ${formatMonth(loanChangedMonth)}`
        : `Unchanged since ${formatMonth(loanChangedMonth)}`,
      stale: loanChangedMonth !== null && loanMonthsSinceChange >= 3,
      hint:
        loanChangedMonth !== null && loanMonthsSinceChange >= 3
          ? "A repaying loan falls every month. Take the balance from your latest statement."
          : null,
    },
    {
      key: "value",
      label: "Market value",
      value: !hasValue
        ? "Not recorded"
        : valueDate
        ? `As at ${formatMonth(monthKey(valueDate))}`
        : "Recorded (date unknown)",
      stale: !hasValue || (valueAgeDays !== null && valueAgeDays > 365),
      hint: !hasValue
        ? "Needed for true equity and capital growth."
        : valueAgeDays !== null && valueAgeDays > 365
        ? "Over a year old. Consider an updated valuation."
        : null,
    },
    {
      key: "rate",
      label: "Interest rate",
      value: !rateSet
        ? "Not recorded"
        : rateUpdated
        ? `${property.interestRate}% · updated ${formatDay(rateUpdated)}`
        : `${property.interestRate}%`,
      stale: !rateSet || (rateAgeDays !== null && rateAgeDays > 365),
      hint: !rateSet
        ? "Enables loan checks and real projections."
        : rateAgeDays !== null && rateAgeDays > 365
        ? "Banks change rates. Check it against your latest statement."
        : null,
    },
  ];

  const label =
    status === "none"
      ? "No check-ins yet"
      : status === "overdue"
      ? `${formatMonth(dueMonth)} check-in overdue`
      : status === "due"
      ? `${formatMonth(dueMonth)} check-in due`
      : "Up to date";

  return {
    status,
    label,
    tone: status === "up-to-date" ? "positive" : status === "due" ? "caution" : "negative",
    latestMonth: latest?.month || null,
    enteredAt: enteredValid ? enteredAt : null,
    daysSinceEntry,
    dueMonth,
    nextDue,
    checkinDay,
    batches,
    figures,
    summary: latest
      ? `Last check-in ${enteredValid ? `${formatDay(enteredAt)} (${relativeDays(daysSinceEntry)})` : ""}, covering ${formatMonth(latest.month)}`
      : "No check-ins recorded yet",
  };
}
