import { amount, formatMonth, toAmount } from "./propertyFinancials";
import { getCurrentTenancy, getTenancies } from "./tenancies";

/*
 * Rent tracking.
 *
 * A check-in may record `rentDue`, the rent owed for that month. Comparing
 * it with `rentalReceived` (all rent money that arrived that month) gives a
 * simple running account:
 *
 *   owed = max(0, owed + due − received)   month by month, oldest first
 *
 * so a tenant who pays two months' rent in November clears October's
 * shortfall without any extra steps. Months without `rentDue` (including
 * everything recorded before this feature) are not tracked and don't count.
 */

/* What rent is due for a new month: the tenancy rent, else the expected rent. */
export function expectedRentDue(property) {
  const tenant = getCurrentTenancy(property);
  if (tenant && toAmount(tenant.rent) !== null) return String(toAmount(tenant.rent));
  // Tenancies recorded but none current: vacant, nothing due.
  if (!tenant && getTenancies(property).length) return "0";
  const expected = toAmount(property?.monthlyRental);
  return expected !== null ? String(expected) : "";
}

export function rentStatus(checkin) {
  const due = toAmount(checkin?.rentDue);
  const received = amount(checkin?.rentalReceived);
  const late = checkin?.rentTiming === "late";

  if (due === null) return { state: "untracked", label: "", tone: "neutral" };
  if (due === 0) {
    return received > 0
      ? { state: "extra", label: `No rent due; ${fmt(received)} received`, short: "Extra", tone: "positive" }
      : { state: "none-due", label: "No rent due", short: "No rent due", tone: "neutral" };
  }
  if (received >= due - 0.005) {
    const extra = received - due;
    return {
      state: "paid",
      label: `${late ? "Paid late" : "Paid in full"}${extra > 0.005 ? `, plus ${fmt(extra)} towards earlier months` : ""}`,
      short: late ? "Paid late" : "Paid",
      tone: late ? "caution" : "positive",
    };
  }
  if (received <= 0) return { state: "unpaid", label: "Not paid", short: "Not paid", tone: "negative" };
  return {
    state: "partial",
    label: `Part paid, ${fmt(due - received)} short`,
    short: "Part paid",
    tone: "caution",
  };
}

function fmt(value) {
  const decimals = Number.isInteger(Math.round(value * 100) / 100) ? 0 : 2;
  return `RM ${value.toLocaleString("en-MY", { minimumFractionDigits: decimals, maximumFractionDigits: 2 })}`;
}

/*
 * Running rent owed across check-ins (any order in).
 * Returns { owed, since } where `since` is the first month of the current
 * unpaid run, or null.
 */
export function rentArrears(checkins = []) {
  const tracked = checkins
    .filter((c) => c?.month && toAmount(c.rentDue) !== null)
    .sort((a, b) => String(a.month).localeCompare(String(b.month)));

  let owed = 0;
  let since = null;

  tracked.forEach((c) => {
    const next = Math.max(0, owed + amount(c.rentDue) - amount(c.rentalReceived));
    if (owed <= 0.005 && next > 0.005) since = c.month;
    if (next <= 0.005) since = null;
    owed = next;
  });

  owed = Math.round(owed * 100) / 100;
  return { owed: owed > 0.005 ? owed : 0, since: owed > 0.005 ? since : null, sinceLabel: since ? formatMonth(since) : "" };
}
