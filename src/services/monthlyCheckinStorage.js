const CHECKIN_STORAGE_KEY = "aequitas-monthly-checkins";

/*
 * Must match services/storage.js. This previously pointed at "properties",
 * a key the rest of the app never reads, so check-ins never updated the
 * property record.
 */
const PROPERTY_STORAGE_KEY = "aequitas-properties";

function readCheckins() {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(CHECKIN_STORAGE_KEY) || "[]"
    );

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCheckins(checkins) {
  localStorage.setItem(
    CHECKIN_STORAGE_KEY,
    JSON.stringify(checkins)
  );
}

function readProperties() {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(PROPERTY_STORAGE_KEY) || "[]"
    );

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeProperties(properties) {
  localStorage.setItem(
    PROPERTY_STORAGE_KEY,
    JSON.stringify(properties)
  );
}

function syncPropertyPosition(propertyId, record) {
  const properties = readProperties();

  const propertyIndex = properties.findIndex(
    (property) => String(property.id) === String(propertyId)
  );

  if (propertyIndex < 0) return;

  const property = { ...properties[propertyIndex] };
  let changed = false;

  if (record.outstandingLoan !== "") {
    property.outstandingLoan = record.outstandingLoan;
    changed = true;
  }

  if (record.marketValue !== "" && record.marketValue > 0) {
    property.marketValue = record.marketValue;
    changed = true;
  }

  if (!changed) return;

  properties[propertyIndex] = property;
  writeProperties(properties);
}

export function getMonthlyCheckins(propertyId) {
  return readCheckins()
    .filter(
      (item) =>
        String(item.propertyId) === String(propertyId)
    )
    .sort((a, b) =>
      String(b.month).localeCompare(String(a.month))
    );
}

export function getMonthlyCheckin(propertyId, month) {
  return (
    readCheckins().find(
      (item) =>
        String(item.propertyId) === String(propertyId) &&
        item.month === month
    ) || null
  );
}

export function saveMonthlyCheckin({
  propertyId,
  month,
  rentalReceived,
  loanInstalment,
  maintenancePaid,
  otherExpenses,
  outstandingLoan,
  marketValue,
  note,
  rentDue,
  rentTiming,
  rentReceivedOn,
}) {
  if (!propertyId) {
    throw new Error("A property ID is required.");
  }

  if (!month) {
    throw new Error("A check-in month is required.");
  }

  const now = new Date().toISOString();
  const checkins = readCheckins();

  const existingIndex = checkins.findIndex(
    (item) =>
      String(item.propertyId) === String(propertyId) &&
      item.month === month
  );

  const existing =
    existingIndex >= 0
      ? checkins[existingIndex]
      : null;

  const record = {
    id:
      existing?.id ??
      `checkin-${propertyId}-${month}`,

    propertyId,
    month,

    rentalReceived:
      rentalReceived === ""
        ? ""
        : Number(rentalReceived) || 0,

    loanInstalment:
      loanInstalment === ""
        ? ""
        : Number(loanInstalment) || 0,

    maintenancePaid:
      maintenancePaid === ""
        ? ""
        : Number(maintenancePaid) || 0,

    otherExpenses:
      otherExpenses === ""
        ? ""
        : Number(otherExpenses) || 0,

    outstandingLoan:
      outstandingLoan === ""
        ? ""
        : Number(outstandingLoan) || 0,

    marketValue:
      marketValue === ""
        ? ""
        : Number(marketValue) || 0,

    note: note?.trim() || "",

    /*
     * Rent tracking (optional). Left out by a caller = keep what was saved,
     * so older screens never wipe it.
     *   rentDue: rent owed for this month ("" = not tracked, 0 = none due)
     *   rentTiming: "on-time" | "late" | ""
     *   rentReceivedOn: "YYYY-MM-DD" or ""
     */
    rentDue:
      rentDue === undefined
        ? existing?.rentDue ?? ""
        : rentDue === ""
        ? ""
        : Number(rentDue) || 0,

    rentTiming:
      rentTiming === undefined ? existing?.rentTiming ?? "" : rentTiming || "",

    rentReceivedOn:
      rentReceivedOn === undefined ? existing?.rentReceivedOn ?? "" : rentReceivedOn || "",

    createdAt:
      existing?.createdAt ?? now,

    updatedAt: now,
  };

  if (existingIndex >= 0) {
    checkins[existingIndex] = record;
  } else {
    checkins.push(record);
  }

  writeCheckins(checkins);

  /*
   * Keep the property's current position aligned with the latest check-in.
   *
   * Rules:
   * - Only point-in-time balances are copied: outstanding loan and market
   *   value. Monthly flows (rent received, instalment paid) are actual
   *   results for that month and do not overwrite the property's expected
   *   rent or instalment, which are changed by editing the property.
   * - Only when the saved month is the most recent month on record, so
   *   back-filling an older month never overwrites a newer balance.
   * - Blank fields are ignored.
   *
   * Historical monthly records remain untouched.
   */

  const latestMonth = checkins
    .filter((item) => String(item.propertyId) === String(propertyId))
    .map((item) => String(item.month))
    .sort()
    .pop();

  if (latestMonth === month) {
    syncPropertyPosition(propertyId, record);
  }

  return record;
}

export function deleteMonthlyCheckin(
  propertyId,
  month
) {
  const next = readCheckins().filter(
    (item) =>
      !(
        String(item.propertyId) === String(propertyId) &&
        item.month === month
      )
  );

  writeCheckins(next);
}