import { useEffect, useRef, useState } from "react";

import {
  DEFAULT_SETTINGS,
  getSettings,
  saveSettings,
} from "../services/settingsStorage";
import { applyTheme } from "../theme";
import {
  canPromptInstall,
  isInstalledApp,
  onInstallAvailabilityChange,
  promptInstall,
} from "../pwa";
import useFiles from "../hooks/useFiles";
import { formatBytes } from "../services/fileStore";
import { buildBackup, downloadBackup, readBackupFile, restoreFiles } from "../services/backup";
import { downloadReminder, googleCalendarUrl } from "../utils/calendarReminder";

/*
 * Settings — Backup & Restore
 *
 * Aequitas currently keeps all data in this browser's LocalStorage.
 * This page lets the investor download a copy and restore it.
 *
 * File format: a JSON object of { storageKey: rawStoredString }, identical
 * to the manual console backup, so earlier backup files can be restored.
 * When documents are stored, the backup is a .zip holding that same JSON
 * plus the files (see services/backup.js).
 *
 * Safety:
 * - Restore always downloads a copy of the current data first.
 * - Restore only writes the keys contained in the file; it never deletes
 *   other keys.
 */

const LAST_BACKUP_KEY = "aequitas-last-backup";

function isAequitasKey(key) {
  return key.startsWith("aequitas-") || key === "properties";
}

function readAllData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && isAequitasKey(key) && key !== LAST_BACKUP_KEY) {
      data[key] = localStorage.getItem(key);
    }
  }
  return data;
}

function parseArray(raw) {
  try {
    const value = JSON.parse(raw || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function describe(data) {
  const properties = parseArray(data["aequitas-properties"]);
  const checkins = parseArray(data["aequitas-monthly-checkins"]);
  const months = checkins
    .map((item) => item?.month)
    .filter(Boolean)
    .sort();

  return {
    properties: properties.length,
    propertyNames: properties
      .map((p) => p?.projectName)
      .filter(Boolean)
      .join(", "),
    checkins: checkins.length,
    latestMonth: months[months.length - 1] || null,
  };
}

function validateBackup(parsed) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return "This file is not an Aequitas backup.";
  }

  const keys = Object.keys(parsed).filter(isAequitasKey);

  if (!keys.includes("aequitas-properties")) {
    return "This file does not contain any Aequitas property data.";
  }

  for (const key of keys) {
    if (typeof parsed[key] !== "string") {
      return `The entry "${key}" is not in the expected format.`;
    }
    try {
      JSON.parse(parsed[key]);
    } catch {
      return `The entry "${key}" is damaged and cannot be read.`;
    }
  }

  return null;
}

function formatMonth(month) {
  if (!month) return "none";
  const [y, m] = month.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-MY", {
    month: "long",
    year: "numeric",
  });
}

const panel = {
  padding: 18,
  borderRadius: 14,
  border: "1px solid var(--color-border-strong)",
  background: "var(--color-surface-sunken)",
};

const THEMES = [
  ["dark", "🌙 Dark"],
  ["light", "☀️ Light"],
  ["system", "🖥️ Follow device"],
];

function clampRate(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(20, Math.max(-10, n));
}

export default function Settings() {
  const fileInput = useRef(null);
  const [current, setCurrent] = useState(() => describe(readAllData()));
  const [lastBackup, setLastBackup] = useState(() =>
    localStorage.getItem(LAST_BACKUP_KEY)
  );
  const [pending, setPending] = useState(null);
  const [working, setWorking] = useState(false);
  const { files: storedFiles } = useFiles();
  const [message, setMessage] = useState(null);
  const [prefs, setPrefs] = useState(() => getSettings());
  const [installable, setInstallable] = useState(() => canPromptInstall());
  const installed = isInstalledApp();

  useEffect(() => onInstallAvailabilityChange(setInstallable), []);

  function updatePrefs(patch) {
    const next = saveSettings(patch);
    setPrefs(next);
    if (patch.theme) applyTheme(patch.theme);
  }

  async function handleExport() {
    setWorking(true);
    try {
      const backup = await buildBackup(readAllData(), "aequitas-backup");
      downloadBackup(backup);
      const now = new Date().toISOString();
      localStorage.setItem(LAST_BACKUP_KEY, now);
      setLastBackup(now);
      setMessage({
        tone: "ok",
        text: backup.fileCount
          ? `Backup downloaded, including ${backup.fileCount} document${backup.fileCount === 1 ? "" : "s"} (${formatBytes(backup.bytes)}).`
          : "Backup downloaded.",
      });
    } catch {
      setMessage({ tone: "error", text: "The backup couldn't be created. Try again, or free up space on this device." });
    } finally {
      setWorking(false);
    }
  }

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setPending(null);
    setMessage(null);
    if (!file) return;

    let parsed;
    try {
      parsed = await readBackupFile(file);
    } catch (error) {
      setMessage({ tone: "error", text: error.message });
      return;
    }

    const problem = validateBackup(parsed.data);
    if (problem) {
      setMessage({ tone: "error", text: problem });
      return;
    }

    const data = Object.fromEntries(
      Object.entries(parsed.data).filter(
        ([key]) => isAequitasKey(key) && key !== LAST_BACKUP_KEY
      )
    );

    setPending({ fileName: file.name, data, files: parsed.files, summary: describe(data) });
  }

  async function handleRestore() {
    if (!pending) return;

    const confirmed = window.confirm(
      "Restore this backup?\n\n" +
        "Your current data will be replaced by the backup. A copy of your " +
        "current data will be downloaded first so you can undo this."
    );
    if (!confirmed) return;

    setWorking(true);
    try {
      downloadBackup(await buildBackup(readAllData(), "aequitas-before-restore"));

      Object.entries(pending.data).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      if (pending.files.length) await restoreFiles(pending.files);
    } catch {
      setWorking(false);
      setMessage({
        tone: "error",
        text: "Restoring stopped part-way, possibly because this device is low on space. Your earlier data was downloaded first.",
      });
      return;
    }

    setPending(null);
    setCurrent(describe(readAllData()));
    setMessage({
      tone: "ok",
      text: "Backup restored. Reloading so every page uses the restored data…",
    });
    setTimeout(() => window.location.reload(), 1200);
  }

  return (
    <div className="page-container">
      <section className="page-header">
        <p className="page-subtitle">SETTINGS</p>
        <h1 style={{ marginTop: 0 }}>Settings</h1>
      </section>

      <div style={{ display: "grid", gap: 16, marginTop: 20 }}>
        <section style={panel}>
          <div className="card-label">APPEARANCE</div>
          <div
            role="radiogroup"
            aria-label="Theme"
            style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}
          >
            {THEMES.map(([value, label]) => {
              const active = prefs.theme === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => updatePrefs({ theme: value })}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "inherit",
                    border: active
                      ? "1px solid var(--color-primary)"
                      : "1px solid var(--color-border-strong)",
                    background: active ? "var(--color-primary-soft)" : "transparent",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        <section style={panel}>
          <div className="card-label">YOUR NAME</div>
          <p className="page-subtitle" style={{ margin: "8px 0 10px" }}>
            Used to greet you in the Executive Brief on Home.
          </p>
          <input
            type="text"
            value={prefs.investorName}
            placeholder="Your name (optional)"
            maxLength={40}
            onChange={(event) => updatePrefs({ investorName: event.target.value })}
            style={{ width: "100%", boxSizing: "border-box" }}
          />
        </section>

        <section style={panel}>
          <div className="card-label">REMINDERS</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: 14,
              marginTop: 12,
            }}
          >
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                Monthly check-in due on
              </span>
              <select
                value={prefs.checkinDay}
                onChange={(event) => updatePrefs({ checkinDay: Number(event.target.value) })}
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    Day {day} of each month
                  </option>
                ))}
              </select>
              <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                Pick a day after your rent and loan statement usually arrive.
              </span>
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                Add it to your calendar:{" "}
                <button
                  type="button"
                  onClick={() => downloadReminder(prefs.checkinDay)}
                  style={{ background: "none", border: "none", padding: 0, color: "var(--color-link)", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
                >
                  Apple or Outlook
                </button>
                {" · "}
                <a href={googleCalendarUrl(prefs.checkinDay)} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: "var(--color-link)" }}>
                  Google Calendar
                </a>
              </span>
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                Backup reminder after
              </span>
              <select
                value={prefs.backupReminderDays}
                onChange={(event) => updatePrefs({ backupReminderDays: Number(event.target.value) })}
              >
                {[7, 14, 30, 60, 90].map((days) => (
                  <option key={days} value={days}>
                    {days} days
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section style={panel}>
          <div className="card-label">FORECAST ASSUMPTIONS</div>
          <p className="page-subtitle" style={{ margin: "8px 0 12px" }}>
            Growth rates used by the 5-year projection on each property&apos;s
            Intelligence tab. They are assumptions, not predictions.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
              gap: 14,
            }}
          >
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                Property value growth (% a year)
              </span>
              <input
                type="number"
                step="0.1"
                value={prefs.valueGrowth}
                onChange={(event) =>
                  updatePrefs({ valueGrowth: clampRate(event.target.value) })
                }
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                Rent growth (% a year)
              </span>
              <input
                type="number"
                step="0.1"
                value={prefs.rentGrowth}
                onChange={(event) =>
                  updatePrefs({ rentGrowth: clampRate(event.target.value) })
                }
              />
            </label>
          </div>
          {(prefs.valueGrowth !== DEFAULT_SETTINGS.valueGrowth ||
            prefs.rentGrowth !== DEFAULT_SETTINGS.rentGrowth) && (
            <button
              type="button"
              className="btn-secondary"
              style={{ marginTop: 12, padding: "10px 16px", borderRadius: 12, fontWeight: 600, cursor: "pointer" }}
              onClick={() =>
                updatePrefs({
                  valueGrowth: DEFAULT_SETTINGS.valueGrowth,
                  rentGrowth: DEFAULT_SETTINGS.rentGrowth,
                })
              }
            >
              Reset to {DEFAULT_SETTINGS.valueGrowth}% and {DEFAULT_SETTINGS.rentGrowth}%
            </button>
          )}
        </section>

        <p className="page-subtitle" style={{ margin: "8px 0 0" }}>
          <strong>Backup &amp; restore.</strong> Aequitas stores your data in
          this browser only. Clearing browser data, or switching to another
          browser or device, will not bring it with you. Download a backup
          regularly.
        </p>
        <section style={panel}>
          <div className="card-label">YOUR DATA IN THIS BROWSER</div>
          <div style={{ marginTop: 10, lineHeight: 1.8 }}>
            <div>
              <strong>{current.properties}</strong>{" "}
              {current.properties === 1 ? "property" : "properties"}
              {current.propertyNames && (
                <span className="page-subtitle"> ({current.propertyNames})</span>
              )}
            </div>
            <div>
              <strong>{current.checkins}</strong> monthly check-ins
              {current.latestMonth && (
                <span className="page-subtitle">
                  {" "}
                  (latest: {formatMonth(current.latestMonth)})
                </span>
              )}
            </div>
            <div>
              <strong>{storedFiles.length}</strong> document{storedFiles.length === 1 ? "" : "s"}
              {storedFiles.length > 0 && (
                <span className="page-subtitle">
                  {" "}
                  ({formatBytes(storedFiles.reduce((sum, f) => sum + (f.size || 0), 0))}, included in the backup as a
                  .zip)
                </span>
              )}
            </div>
            <div className="page-subtitle">
              Last backup from this page:{" "}
              {lastBackup
                ? new Date(lastBackup).toLocaleString("en-MY")
                : "never"}
            </div>
          </div>

          <button
            type="button"
            className="primary-button"
            style={{ marginTop: 14, width: "auto" }}
            onClick={handleExport}
            disabled={working}
          >
            {working ? "Preparing backup…" : "⬇ Download backup"}
          </button>
        </section>

        <section style={panel}>
          <div className="card-label">RESTORE FROM A BACKUP</div>
          <p className="page-subtitle" style={{ margin: "8px 0 14px" }}>
            Choose an Aequitas backup file (.json, or .zip when it includes
            documents). You'll see what it contains before anything is changed.
          </p>

          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json,application/zip,.zip"
            onChange={handleFile}
            style={{ display: "none" }}
          />
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: "12px 18px", borderRadius: 12, fontWeight: 600, cursor: "pointer" }}
            onClick={() => fileInput.current?.click()}
          >
            Choose backup file…
          </button>

          {pending && (
            <div
              style={{
                marginTop: 14,
                padding: 14,
                borderRadius: 10,
                border: "1px solid var(--color-border-strong)",
                background: "var(--color-surface)",
              }}
            >
              <strong>{pending.fileName}</strong>
              <div className="page-subtitle" style={{ marginTop: 6, lineHeight: 1.7 }}>
                {pending.summary.properties}{" "}
                {pending.summary.properties === 1 ? "property" : "properties"}
                {pending.summary.propertyNames &&
                  ` (${pending.summary.propertyNames})`}
                , {pending.summary.checkins} check-ins (latest:{" "}
                {formatMonth(pending.summary.latestMonth)})
                {pending.files.length > 0 &&
                  `, ${pending.files.length} document${pending.files.length === 1 ? "" : "s"}`}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="primary-button"
                  style={{ width: "auto" }}
                  onClick={handleRestore}
                  disabled={working}
                >
                  {working ? "Restoring…" : "Restore this backup"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: "12px 18px", borderRadius: 12, fontWeight: 600, cursor: "pointer" }}
                  onClick={() => setPending(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        {message && (
          <div
            role="status"
            style={{
              padding: 14,
              borderRadius: 10,
              border: `1px solid ${message.tone === "error" ? "var(--color-danger-border)" : "var(--color-success-border)"}`,
              background:
                message.tone === "error"
                  ? "rgba(249,115,22,0.08)"
                  : "rgba(34,197,94,0.08)",
            }}
          >
            {message.text}
          </div>
        )}

        <section style={panel}>
          <div className="card-label">INSTALL ON YOUR PHONE</div>
          {installed ? (
            <p style={{ margin: "10px 0 0" }}>✓ You&apos;re using the installed Aequitas app.</p>
          ) : (
            <>
              {installable && (
                <button
                  type="button"
                  className="primary-button"
                  style={{ width: "auto", marginTop: 12 }}
                  onClick={() => promptInstall()}
                >
                  Install Aequitas
                </button>
              )}
              <ul
                className="page-subtitle"
                style={{ margin: "12px 0 0", paddingLeft: 20, lineHeight: 1.7 }}
              >
                <li>
                  <strong>iPhone / iPad:</strong> open this site in Safari, tap the Share button,
                  then <em>Add to Home Screen</em>.
                </li>
                <li>
                  <strong>Android:</strong> open this site in Chrome, tap the ⋮ menu, then{" "}
                  <em>Install app</em> (or <em>Add to Home screen</em>).
                </li>
              </ul>
            </>
          )}
          <p className="page-subtitle" style={{ margin: "12px 0 0", fontSize: 13, lineHeight: 1.6 }}>
            Each device, and the installed app, keeps its own copy of your data. To move your data,
            download a backup here, send the file to your phone, then open Settings in the app and
            restore it. On iPhone, use the installed app rather than a Safari tab: Safari may clear
            data for sites you haven&apos;t opened for a while.
          </p>
        </section>

        <section style={panel}>
          <div className="card-label">ABOUT</div>
          <ul className="page-subtitle" style={{ margin: "10px 0 0", paddingLeft: 20, lineHeight: 1.7 }}>
            <li>Your data is stored in this browser&apos;s local storage, on this device only.</li>
            <li>Nothing is sent to a server. Backups are files you download and keep.</li>
            <li>
              Aequitas explains your recorded figures. It does not give financial,
              legal or tax advice.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
