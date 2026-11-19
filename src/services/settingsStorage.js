/*
 * Aequitas settings, stored in this browser under "aequitas-settings".
 * Included automatically in backups (all "aequitas-" keys are exported).
 */

const SETTINGS_KEY = "aequitas-settings";
export const LAST_BACKUP_KEY = "aequitas-last-backup";

export const DEFAULT_SETTINGS = {
  investorName: "",
  theme: "dark", // "dark" | "light" | "system"
  valueGrowth: 4, // % a year, used by the 5-year projection
  rentGrowth: 2, // % a year
  backupReminderDays: 30,
  checkinDay: 7, // day of the month the current month's check-in becomes due
};

export function getSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    return { ...DEFAULT_SETTINGS, ...(stored && typeof stored === "object" ? stored : {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
    // Storage full or unavailable: settings simply aren't kept.
  }
  window.dispatchEvent(new CustomEvent("aequitas-settings", { detail: next }));
  return next;
}

export function getLastBackup() {
  try {
    return localStorage.getItem(LAST_BACKUP_KEY);
  } catch {
    return null;
  }
}

/*
 * Days since the last backup made from the Settings page, or null if
 * there has never been one.
 */
export function daysSinceBackup(now = new Date()) {
  const last = getLastBackup();
  if (!last) return null;
  const then = new Date(last);
  if (Number.isNaN(then.getTime())) return null;
  return Math.floor((now - then) / 86400000);
}
