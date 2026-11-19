import { getMonthlyCheckins } from "../services/monthlyCheckinStorage";
import { calculatePerformanceIntelligence } from "./PerformanceIntelligenceEngine";
import { getDocuments } from "./documents";
import { formatRM, toAmount } from "./propertyFinancials";
import { billEvents } from "./yearlyBills";
import { getTenancies } from "./tenancies";

/*
 * Property timeline — past and upcoming events built from recorded data:
 * purchase, check-ins, valuations, loan changes, tenancy and insurance
 * dates, yearly bill due dates and payments, and RPGT holding-period
 * milestones.
 *
 * Each event: { date: "YYYY-MM-DD", title, detail?, tone?, monthOnly? }
 */

/* Check-in events are dated to the 1st of their month and shown as a month. */
function monthStart(month) {
  return `${month}-01`;
}

function addYears(iso, years) {
  const d = new Date(`${iso}T00:00:00`);
  d.setFullYear(d.getFullYear() + years);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function iso(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function getPropertyEvents(property, today = new Date()) {
  const events = [];
  const todayIso = iso(today);
  const checkins = getMonthlyCheckins(property?.id)
    .filter((c) => c?.month)
    .sort((a, b) => String(a.month).localeCompare(String(b.month)));

  if (property?.purchaseDate) {
    events.push({ date: property.purchaseDate, title: "Purchased (SPA signed)" });

    // RPGT for individual Malaysian citizens & PRs (Part I, Schedule 5).
    [
      [3, "RPGT rate falls from 30% to 20%", "Start of the 4th year of ownership (citizens & PRs)."],
      [4, "RPGT rate falls to 15%", "Start of the 5th year of ownership (citizens & PRs)."],
      [5, "RPGT rate falls to 0%", "From the 6th year of ownership (citizens & PRs)."],
    ].forEach(([years, title, detail]) => {
      events.push({ date: addYears(property.purchaseDate, years), title, detail, tone: "info" });
    });
  }

  if (checkins.length) {
    events.push({
      date: monthStart(checkins[0].month),
      monthOnly: true,
      title: "First monthly check-in recorded",
    });
  }

  let lastValue = null;
  checkins.forEach((c) => {
    const value = toAmount(c.marketValue);
    if (value && value > 0 && value !== lastValue) {
      events.push({
        date: monthStart(c.month),
        monthOnly: true,
        title: `Valuation recorded: ${formatRM(value)}`,
      });
      lastValue = value;
    }
  });

  const flags = calculatePerformanceIntelligence(property).dataFlags || [];
  flags
    .filter((f) => f.type === "loan-increase")
    .forEach((f) =>
      events.push({
        date: monthStart(f.toMonth),
        monthOnly: true,
        title: `Loan balance rose by ${formatRM(f.change, 2)}`,
        detail: "Check against your loan statement.",
        tone: "warning",
      })
    );

  const docs = getDocuments(property);
  const tenancies = getTenancies(property);
  if (tenancies.length) {
    tenancies.forEach((t) => {
      const renewal = Boolean(t.renewedFrom);
      if (t.startDate) {
        events.push({
          date: t.startDate,
          title: renewal ? `Tenancy renewed${t.tenantName ? ` with ${t.tenantName}` : ""}` : `Tenancy started${t.tenantName ? `: ${t.tenantName}` : ""}`,
        });
      }
      if (t.status === "ended" && t.closing?.reason === "moved-out" && t.closing.date) {
        events.push({
          date: t.closing.date,
          title: "Tenant moved out",
          detail:
            toAmount(t.closing.returned) !== null
              ? `Deposit returned: ${formatRM(toAmount(t.closing.returned), 2)}`
              : undefined,
        });
      }
      if (t.status === "current" && t.endDate) {
        const past = t.endDate < todayIso;
        events.push({
          date: t.endDate,
          title: past ? "Tenancy ended" : "Tenancy ends",
          detail: past ? "Record the renewal or the move-out under Tenant." : "Decide on renewal before this date.",
          tone: "warning",
        });
      }
    });
  } else {
    if (docs.tenancy?.startDate) events.push({ date: docs.tenancy.startDate, title: "Tenancy started" });
    if (docs.tenancy?.endDate) {
      const past = docs.tenancy.endDate < todayIso;
      events.push({
        date: docs.tenancy.endDate,
        title: past ? "Tenancy ended" : "Tenancy ends",
        detail: past ? "Record the new tenancy if it was renewed." : "Decide on renewal before this date.",
        tone: "warning",
      });
    }
  }
  if (docs.insurance?.expiryDate) {
    events.push({
      date: docs.insurance.expiryDate,
      title: docs.insurance.expiryDate < todayIso ? "Insurance expired" : "Insurance expires",
      tone: "warning",
    });
  }
  if (docs.valuation?.date) events.push({ date: docs.valuation.date, title: "Valuation report" });

  events.push(...billEvents(property, today));

  const sorted = events
    .filter((e) => e.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    past: sorted.filter((e) => e.date <= todayIso).reverse(),
    upcoming: sorted.filter((e) => e.date > todayIso),
  };
}
