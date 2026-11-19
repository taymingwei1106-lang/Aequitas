import { updateProperty } from "../services/storage";
import { toAmount } from "./propertyFinancials";

/*
 * Yearly property bills: assessment tax (cukai taksiran, two halves) and
 * quit rent (cukai tanah / cukai petak).
 *
 * Due dates are the ones most councils and land offices use:
 *   - Assessment tax, 1st half: end of February
 *   - Quit rent: 31 May
 *   - Assessment tax, 2nd half: end of August
 * A few councils differ, so each card says "check your bill".
 *
 * Payments are saved on the property record:
 *   property.yearlyBills = {
 *     "2026": {
 *       quitRent:    { status: "paid", amount: "120", paidOn: "2026-05-02" },
 *       assessment1: { status: "na" },          // not applicable this year
 *     }
 *   }
 * Nothing is assumed paid: a bill without a record is "not marked".
 */

export const YEARLY_BILLS = [
  {
    id: "assessment1",
    label: "Assessment tax, 1st half",
    shortLabel: "Assessment (1st half)",
    taxGroup: "assessment",
    monthlyField: "assessmentTax",
    months: 6,
    due: (year) => lastDayOfMonth(year, 2),
  },
  {
    id: "quitRent",
    label: "Quit rent",
    shortLabel: "Quit rent",
    taxGroup: "quitRent",
    monthlyField: "quitRent",
    months: 12,
    due: (year) => `${year}-05-31`,
  },
  {
    id: "assessment2",
    label: "Assessment tax, 2nd half",
    shortLabel: "Assessment (2nd half)",
    taxGroup: "assessment",
    monthlyField: "assessmentTax",
    months: 6,
    due: (year) => `${year}-08-31`,
  },
];

function lastDayOfMonth(year, month) {
  const day = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isoToday(today) {
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;
}

function daysBetween(fromIso, toIso) {
  const from = new Date(`${fromIso}T00:00:00`);
  const to = new Date(`${toIso}T00:00:00`);
  return Math.round((to - from) / 86400000);
}

export function getBillRecord(property, year, billId) {
  return property?.yearlyBills?.[String(year)]?.[billId] || null;
}

/*
 * Expected amount from the property's monthly figure (the wizard stores
 * quit rent and assessment as monthly amounts). Null when not entered.
 */
export function expectedBillAmount(property, bill) {
  const monthly = toAmount(property?.[bill.monthlyField]);
  if (monthly === null || monthly <= 0) return null;
  return monthly * bill.months;
}

/*
 * Status of each bill for a year.
 * status: "paid" | "na" | "before-purchase" | "upcoming" | "due-soon" | "not-marked"
 */
export function getBillsForYear(property, year, today = new Date()) {
  const todayIso = isoToday(today);
  const purchaseDate = property?.purchaseDate || "";

  return YEARLY_BILLS.map((bill) => {
    const dueDate = bill.due(year);
    const record = getBillRecord(property, year, bill.id);
    const days = daysBetween(todayIso, dueDate);
    const paidAmount = record?.status === "paid" ? toAmount(record.amount) : null;

    let status;
    if (record?.status === "paid") status = "paid";
    else if (record?.status === "na") status = "na";
    else if (purchaseDate && dueDate < purchaseDate) status = "before-purchase";
    else if (days < 0) status = "not-marked";
    else if (days <= 30) status = "due-soon";
    else status = "upcoming";

    return {
      ...bill,
      year,
      dueDate,
      days,
      record,
      status,
      paidAmount,
      expected: expectedBillAmount(property, bill),
    };
  });
}

export function saveBillRecord(property, year, billId, record) {
  const yearKey = String(year);
  const all = { ...(property?.yearlyBills || {}) };
  const forYear = { ...(all[yearKey] || {}) };

  if (record) forYear[billId] = record;
  else delete forYear[billId];

  all[yearKey] = forYear;
  updateProperty(property.id, { yearlyBills: all });
}

/* Amount paid in a year for "quitRent" or "assessment" (for the tax summary). */
export function paidBillTotal(property, year, taxGroup) {
  const bills = YEARLY_BILLS.filter((bill) => bill.taxGroup === taxGroup);
  let total = 0;
  let paidCount = 0;
  let missingAmount = 0;

  bills.forEach((bill) => {
    const record = getBillRecord(property, year, bill.id);
    if (record?.status !== "paid") return;
    paidCount += 1;
    const value = toAmount(record.amount);
    if (value === null) missingAmount += 1;
    else total += value;
  });

  return { total, paidCount, billCount: bills.length, missingAmount };
}

/* Attention items for Home: one per property, only for the current year. */
export function billAttention(property, today = new Date()) {
  const year = today.getFullYear();
  const bills = getBillsForYear(property, year, today);
  const name = property?.projectName || "Unnamed property";
  const link = `/property/${property.id}?tab=monthly#yearly-bills`;

  const notMarked = bills.filter((bill) => bill.status === "not-marked");
  const dueSoon = bills.filter((bill) => bill.status === "due-soon");
  const items = [];

  if (dueSoon.length) {
    const bill = dueSoon[0];
    items.push({
      priority: 2,
      emoji: "🧾",
      title: `${name}: ${bill.shortLabel.toLowerCase()} due ${
        bill.days === 0 ? "today" : `in ${bill.days} day${bill.days === 1 ? "" : "s"}`
      }`,
      message: "Pay it by the due date, then mark it paid in Yearly bills.",
      link,
    });
  }

  if (notMarked.length) {
    items.push({
      priority: 3,
      emoji: "🧾",
      title: `${name}: ${notMarked.length} ${year} bill${notMarked.length === 1 ? "" : "s"} not marked paid`,
      message: `${notMarked.map((bill) => bill.shortLabel).join(", ")}. Mark each one paid (or not applicable) so the tax summary has the amounts.`,
      link,
    });
  }

  return items;
}

/* Timeline events: unpaid due dates ahead, and payments recorded. */
export function billEvents(property, today = new Date()) {
  const year = today.getFullYear();
  const events = [];

  [year, year + 1].forEach((y) => {
    getBillsForYear(property, y, today).forEach((bill) => {
      if (bill.status === "paid") {
        events.push({
          date: bill.record.paidOn || bill.dueDate,
          title: `${bill.label} ${y} paid`,
        });
      } else if (bill.status === "upcoming" || bill.status === "due-soon") {
        events.push({ date: bill.dueDate, title: `${bill.label} due`, tone: "info" });
      }
    });
  });

  return events;
}
