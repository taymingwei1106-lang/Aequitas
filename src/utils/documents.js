/*
 * Documents
 *
 * For each document type the investor can keep:
 *   - the files themselves (PDFs, photos), stored on this device — see
 *     services/fileStore.js
 *   - whether they hold the original and where it is kept
 *   - the dates that matter (insurance expiry, valuation date)
 *
 * Register details are stored on the property as
 *   `documents`: { [typeId]: { have, location, ...dates } }
 * Tenancy dates now come from the tenant record (utils/tenancies.js); the
 * older `documents.tenancy` dates are still read when no tenant is recorded.
 *
 * `yearly` types (receipts, statements) ask which year a file is for.
 */

export const DOCUMENT_GROUPS = [
  { id: "purchase", label: "Purchase and title" },
  { id: "loan", label: "Loan" },
  { id: "tenancy", label: "Tenancy" },
  { id: "insurance", label: "Insurance and valuation" },
  { id: "bills", label: "Bills and receipts" },
  { id: "other", label: "Other" },
];

export const DOCUMENT_TYPES = [
  { id: "spa", group: "purchase", label: "Sale & Purchase Agreement (SPA)" },
  { id: "title", group: "purchase", label: "Title (individual or strata)" },
  { id: "loanOffer", group: "loan", label: "Loan letter of offer" },
  { id: "loanAgreement", group: "loan", label: "Loan / facility agreement" },
  { id: "loanStatement", group: "loan", label: "Annual loan statement", yearly: true },
  { id: "tenancy", group: "tenancy", label: "Tenancy agreement" },
  { id: "tenancyStamp", group: "tenancy", label: "Tenancy stamp certificate" },
  { id: "inventory", group: "tenancy", label: "Inventory and handover photos" },
  {
    id: "insurance",
    group: "insurance",
    label: "Fire / houseowner insurance",
    dates: [["expiryDate", "Expiry date"]],
  },
  { id: "valuation", group: "insurance", label: "Valuation report", dates: [["date", "Valuation date"]] },
  { id: "quitRentReceipt", group: "bills", label: "Quit rent receipts", yearly: true },
  { id: "assessmentReceipt", group: "bills", label: "Assessment tax receipts", yearly: true },
  { id: "repairReceipt", group: "bills", label: "Repair and maintenance receipts", yearly: true },
  { id: "other", group: "other", label: "Other documents", yearly: true },
];

export function documentType(id) {
  return DOCUMENT_TYPES.find((type) => type.id === id) || DOCUMENT_TYPES[DOCUMENT_TYPES.length - 1];
}

export function getDocuments(property) {
  const stored = property?.documents;
  return stored && typeof stored === "object" ? stored : {};
}

export function daysUntil(isoDate, today = new Date()) {
  if (!isoDate) return null;
  const target = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target - start) / 86400000);
}

export function formatDate(isoDate) {
  if (!isoDate) return "";
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
}
