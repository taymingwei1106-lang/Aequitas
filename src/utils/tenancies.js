import { updateProperty } from "../services/storage";
import { getDocuments } from "./documents";
import { amount, toAmount } from "./propertyFinancials";

/*
 * Tenants and deposits.
 *
 * Stored on the property as `tenancies`: a list, newest first, of
 *   {
 *     id, tenantName, phone, email,
 *     startDate, endDate,               // "YYYY-MM-DD"
 *     rent, rentDueDay,                 // agreed rent in the tenancy
 *     securityDeposit, utilityDeposit, otherDeposit, otherDepositLabel,
 *     depositHeldBy,                    // "me" | "agent" | ""
 *     notes,
 *     renewedFrom,                      // id of the term this one renewed
 *     status,                           // "current" | "ended"
 *     closing: {                        // when ended
 *       date, reason,                   // "renewed" | "moved-out"
 *       returned, deducted, deductionNote,
 *     }
 *   }
 *
 * No IC or passport numbers are kept: if the phone is lost, less is
 * exposed. The stamped tenancy agreement can be added under Documents.
 *
 * Before tenant records existed, tenancy start/end dates were kept in the
 * documents register (`documents.tenancy`). Those dates are still used
 * when no tenant has been recorded, and offered when adding the first one.
 */

export const DEPOSIT_FIELDS = [
  ["securityDeposit", "Security deposit"],
  ["utilityDeposit", "Utility deposit"],
  ["otherDeposit", "Other deposit"],
];

export function getTenancies(property) {
  const list = Array.isArray(property?.tenancies) ? property.tenancies : [];
  return [...list].sort((a, b) => {
    if (a.status !== b.status) return a.status === "current" ? -1 : 1;
    return String(b.startDate || "").localeCompare(String(a.startDate || ""));
  });
}

export function getCurrentTenancy(property) {
  return getTenancies(property).find((t) => t.status === "current") || null;
}

export function depositTotal(tenancy) {
  return DEPOSIT_FIELDS.reduce((sum, [key]) => sum + amount(tenancy?.[key]), 0);
}

/* Deposit as a number of months' rent, e.g. 2 or 0.5, when rent is known. */
export function depositMonths(value, rent) {
  const v = toAmount(value);
  const r = toAmount(rent);
  if (v === null || r === null || r <= 0 || v <= 0) return null;
  return Math.round((v / r) * 10) / 10;
}

/*
 * The tenancy dates the rest of the app uses (attention, timeline,
 * completeness, report):
 *   - the current tenant's dates, if a tenant is recorded
 *   - otherwise, when every tenancy has ended, the last end date with
 *     `ended: true` (the investor has closed it, so no reminder)
 *   - otherwise the older documents-register dates
 */
export function getTenancyDates(property) {
  const list = getTenancies(property);
  const current = list.find((t) => t.status === "current");
  if (current) {
    return { startDate: current.startDate || "", endDate: current.endDate || "", ended: false, source: "tenant" };
  }
  if (list.length) {
    const last = list[0];
    return {
      startDate: last.startDate || "",
      endDate: last.closing?.date || last.endDate || "",
      ended: true,
      source: "tenant",
    };
  }
  const legacy = getDocuments(property).tenancy || {};
  return { startDate: legacy.startDate || "", endDate: legacy.endDate || "", ended: false, source: "documents" };
}

function write(property, list) {
  updateProperty(property.id, { tenancies: list });
}

export function newTenancyId() {
  return `tenancy-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function saveTenancy(property, tenancy) {
  const list = Array.isArray(property?.tenancies) ? [...property.tenancies] : [];
  const index = list.findIndex((t) => t.id === tenancy.id);
  if (index >= 0) list[index] = tenancy;
  else list.push(tenancy);
  write(property, list);
}

export function closeTenancy(property, id, closing) {
  const list = (property?.tenancies || []).map((t) =>
    t.id === id ? { ...t, status: "ended", closing } : t
  );
  write(property, list);
}

/*
 * Renewal: the current tenancy is closed as "renewed" with its deposits
 * carried forward (nothing returned), and the new term starts with the
 * same tenant details and deposits.
 */
export function renewTenancy(property, id, newTerm) {
  const list = (property?.tenancies || []).map((t) =>
    t.id === id
      ? { ...t, status: "ended", closing: { date: t.endDate || newTerm.startDate, reason: "renewed" } }
      : t
  );
  list.push({ ...newTerm, renewedFrom: id });
  write(property, list);
}

export function addDaysIso(iso, days) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addYearsIso(iso, years) {
  const d = new Date(`${iso}T00:00:00`);
  d.setFullYear(d.getFullYear() + years);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
