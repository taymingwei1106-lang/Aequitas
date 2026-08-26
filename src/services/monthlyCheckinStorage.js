const CHECKIN_STORAGE_KEY = "aequitas-monthly-checkins";
const PROPERTY_STORAGE_KEY = "properties";

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
   * Keep the property's current snapshot
   * aligned with the latest check-in.
   *
   * Historical monthly records remain untouched.
   */

  const properties = readProperties();

  const propertyIndex = properties.findIndex(
    (property) =>
      String(property.id) === String(propertyId)
  );

  if (propertyIndex >= 0) {
    const property = {
      ...properties[propertyIndex],
    };

    if (rentalReceived !== "") {
      property.monthlyRental =
        Number(rentalReceived) || 0;
    }

    if (loanInstalment !== "") {
      property.monthlyInstalment =
        Number(loanInstalment) || 0;
    }

    if (outstandingLoan !== "") {
      property.outstandingLoan =
        Number(outstandingLoan) || 0;
    }

    if (marketValue !== "") {
      property.marketValue =
        Number(marketValue) || 0;
    }

    properties[propertyIndex] = property;

    writeProperties(properties);
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