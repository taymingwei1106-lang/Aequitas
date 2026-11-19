import { useMemo, useState } from "react";

import { formatDay, getFreshness } from "../../utils/freshnessEngine";
import { formatMonth } from "../../utils/propertyFinancials";
import { downloadReminder, googleCalendarUrl } from "../../utils/calendarReminder";

/*
 * Shown at the top of the monthly check-in: when this property was last
 * updated, when the next check-in is due, and how fresh each key figure is.
 * (The overall status pill is under the property name, so it isn't repeated.)
 */
export default function FreshnessPanel({ property }) {
  const f = useMemo(() => getFreshness(property), [property]);

  const next =
    f.status === "up-to-date"
      ? `Next due ${formatDay(f.nextDue)}.`
      : f.status === "none"
      ? "Record your first month below."
      : `${formatMonth(f.dueMonth)} is ${f.status === "overdue" ? "overdue" : "due"}${
          f.status === "overdue" ? "; record it, then any later months" : ""
        }.`;

  const stale = f.figures.filter((fig) => fig.stale && fig.hint);
  const [showNotes, setShowNotes] = useState(false);
  const hasNotes = stale.length > 0 || f.batches.length > 0;

  return (
    <div
      style={{
        marginTop: 16,
        padding: "12px 14px",
        borderRadius: 12,
        border: "1px solid var(--color-border)",
        background: "var(--color-surface-sunken)",
        display: "grid",
        gap: 10,
      }}
    >
      <div style={{ fontSize: 14, lineHeight: 1.5 }}>
        {f.summary}.{" "}
        <span
          style={{
            color: f.status === "up-to-date" ? "var(--color-text-secondary)" : "var(--color-warning)",
            fontWeight: f.status === "up-to-date" ? 400 : 600,
          }}
        >
          {next}
        </span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {f.figures.map((fig) => (
          <span
            key={fig.key}
            title={fig.hint || undefined}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
              borderRadius: 999,
              fontSize: 12,
              border: `1px solid ${fig.stale ? "var(--color-warning-border)" : "var(--color-border)"}`,
              background: "var(--color-surface)",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: fig.stale ? "var(--color-warning)" : "var(--color-success)",
              }}
            />
            <span style={{ color: "var(--color-text-secondary)" }}>{fig.label}:</span>
            <strong style={{ fontWeight: 600 }}>{fig.value}</strong>
          </span>
        ))}
      </div>

      {hasNotes && showNotes && (
        <div style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.5, display: "grid", gap: 2 }}>
          {stale.map((fig) => (
            <span key={fig.key}>
              {fig.label}: {fig.hint}
            </span>
          ))}
          {f.batches.length > 0 && (
            <span>
              {f.batches
                .map(
                  (b) =>
                    `${formatMonth(b.months[0])} to ${formatMonth(b.months[b.months.length - 1])} were entered together on ${formatDay(
                      new Date(`${b.day}T00:00:00`)
                    )}`
                )
                .join("; ")}
              , so those months are only as accurate as the records they came from.
            </span>
          )}
        </div>
      )}
      <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
        {hasNotes && (
          <>
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              aria-expanded={showNotes}
              style={{ background: "none", border: "none", padding: 0, color: "var(--color-link)", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
            >
              {showNotes ? "Hide notes" : "Why these matter"}
            </button>
            {" · "}
          </>
        )}
        Reminder on day {f.checkinDay}:{" "}
        <button
          type="button"
          onClick={() => downloadReminder(f.checkinDay)}
          style={{ background: "none", border: "none", padding: 0, color: "var(--color-link)", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
        >
          Apple / Outlook
        </button>
        {" · "}
        <a href={googleCalendarUrl(f.checkinDay)} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: "var(--color-link)" }}>
          Google Calendar
        </a>
      </div>
    </div>
  );
}
