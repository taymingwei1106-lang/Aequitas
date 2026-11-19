import { getMonthlyCheckins } from "../services/monthlyCheckinStorage";
import { calculatePerformanceIntelligence } from "./PerformanceIntelligenceEngine";
import { daysUntil, formatDate, getDocuments } from "./documents";
import { getFreshness } from "./freshnessEngine";
import { billAttention } from "./yearlyBills";
import { getTenancyDates } from "./tenancies";
import { rentArrears } from "./rentLedger";
import {
  findRecordMismatch,
  formatMonth,
  formatRM,
} from "./propertyFinancials";

/*
 * Home "What needs attention" items.
 *
 * Each item comes from an explicit rule on recorded data. When no rule
 * fires, the list is empty and the Home card is not shown.
 *
 * Rules, in priority order:
 *   1. Loan balance needs checking (rose between check-ins, or the
 *      property record differs from the latest check-in)
 *   2. Check-ins: overdue, due (from the check-in day in Settings), or none yet
 *   3. Tenancy ending within 60 days (or past its end date), insurance expiring within
 *      30 days (or expired), from the tenant record and Documents
 *   4. Yearly bills: due within 30 days, or past due and not marked paid
 *   5. Rent owed by the tenant, from months where rent due was tracked
 *
 * Financial condition (e.g. a monthly loss) is shown in the Executive
 * Brief above this list, so it is not repeated here.
 */

export function generatePortfolioAttention(properties = [], today = new Date()) {
  const items = [];

  properties.forEach((property) => {
    const name = property.projectName || "Unnamed property";
    const link = `/property/${property.id}`;
    const checkins = getMonthlyCheckins(property.id);
    const performance = calculatePerformanceIntelligence(property);
    const loanRose = (performance.dataFlags || []).find(
      (flag) => flag.type === "loan-increase"
    );
    const mismatch = findRecordMismatch(
      property,
      checkins,
      "outstandingLoan",
      "outstandingLoan"
    );

    if (loanRose || mismatch) {
      items.push({
        priority: 1,
        emoji: "🏦",
        title: `${name}: loan balance needs checking`,
        message: loanRose
          ? `The recorded balance rose by ${formatRM(
              loanRose.change,
              2
            )} between ${formatMonth(loanRose.fromMonth)} and ${formatMonth(
              loanRose.toMonth
            )}. Confirm it against your loan statement.`
          : `The property record (${formatRM(
              mismatch.recordValue ?? 0,
              2
            )}) differs from the ${formatMonth(mismatch.month)} check-in (${formatRM(
              mismatch.checkinValue,
              2
            )}).`,
        link,
      });
    }

    const docs = getDocuments(property);
    const tenancy = getTenancyDates(property);
    const tenancyDays = tenancy.ended ? null : daysUntil(tenancy.endDate, today);
    if (tenancyDays !== null && tenancyDays <= 60) {
      items.push({
        priority: tenancyDays < 0 ? 1 : 2,
        emoji: "📄",
        title:
          tenancyDays < 0
            ? `${name}: tenancy ended ${formatDate(tenancy.endDate)}`
            : `${name}: tenancy ends in ${tenancyDays} day${tenancyDays === 1 ? "" : "s"}`,
        message:
          tenancyDays < 0
            ? "Record the renewal, or the move-out and deposit refund, under Tenant."
            : `Ends ${formatDate(tenancy.endDate)}. Decide on renewal and agree terms in time.`,
        link: `${link}?tab=monthly#tenant`,
      });
    }

    const insuranceDays = daysUntil(docs.insurance?.expiryDate, today);
    if (insuranceDays !== null && insuranceDays <= 30) {
      items.push({
        priority: insuranceDays < 0 ? 1 : 2,
        emoji: "🛡️",
        title:
          insuranceDays < 0
            ? `${name}: insurance expired`
            : `${name}: insurance expires in ${insuranceDays} day${insuranceDays === 1 ? "" : "s"}`,
        message: `Expiry ${formatDate(docs.insurance.expiryDate)}. Renew it and update the date in Documents.`,
        link: `${link}?tab=monthly#documents`,
      });
    }

    items.push(...billAttention(property, today));

    const owed = rentArrears(getMonthlyCheckins(property.id));
    if (owed.owed > 0) {
      items.push({
        priority: 2,
        emoji: "💸",
        title: `${name}: tenant owes ${formatRM(owed.owed, 2)} rent`,
        message: `Unpaid since ${owed.sinceLabel}. When it arrives, add it to the rent received in that month's check-in.`,
        link: `${link}?tab=monthly#checkin`,
      });
    }

    const fresh = getFreshness(property, today);
    if (fresh.status === "none") {
      items.push({
        priority: 2,
        emoji: "📝",
        title: `${name}: no monthly check-ins yet`,
        message: "Record a check-in to start building performance history.",
        link: `${link}?tab=monthly`,
      });
    } else if (fresh.status === "overdue") {
      items.push({
        priority: 1,
        emoji: "📝",
        title: `${name}: ${fresh.label}`,
        message: `${fresh.summary}.`,
        link: `${link}?tab=monthly`,
      });
    } else if (fresh.status === "due") {
      items.push({
        priority: 3,
        emoji: "📝",
        title: `${name}: ${fresh.label}`,
        message: `${fresh.summary}.`,
        link: `${link}?tab=monthly`,
      });
    }
  });

  return items.sort((a, b) => a.priority - b.priority);
}
