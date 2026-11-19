import { useMemo, useState } from "react";

import { getPropertyEvents } from "../../utils/propertyEvents";
import { formatDate } from "../../utils/documents";
import { formatMonth } from "../../utils/propertyFinancials";

/*
 * Property timeline: what's coming up and what has happened, built from
 * recorded data. Shows a short view first; "Show all" expands it.
 */

const TONE = {
  warning: "var(--color-warning)",
  info: "var(--color-primary)",
};

function EventRow({ event }) {
  return (
    <li style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 12, padding: "8px 0" }}>
      <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
        {event.monthOnly ? formatMonth(event.date.slice(0, 7)) : formatDate(event.date)}
      </span>
      <span>
        <span style={{ fontWeight: 600, color: TONE[event.tone] || "inherit" }}>{event.title}</span>
        {event.detail && (
          <span style={{ display: "block", fontSize: 13, color: "var(--color-text-secondary)", marginTop: 2 }}>
            {event.detail}
          </span>
        )}
      </span>
    </li>
  );
}

export default function PropertyTimeline({ property }) {
  const [showAll, setShowAll] = useState(false);
  const { past, upcoming } = useMemo(() => getPropertyEvents(property), [property]);

  if (!past.length && !upcoming.length) {
    return (
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-label">TIMELINE</div>
        <p className="page-subtitle" style={{ margin: "8px 0 0" }}>
          Add the purchase date, record check-ins and tenancy dates to build this property&apos;s timeline.
        </p>
      </div>
    );
  }

  const upcomingShown = showAll ? upcoming : upcoming.slice(0, 3);
  const pastShown = showAll ? past : past.slice(0, 3);
  const hidden = upcoming.length - upcomingShown.length + past.length - pastShown.length;

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div className="card-label">TIMELINE</div>

      {upcomingShown.length > 0 && (
        <>
          <h4 style={{ margin: "12px 0 4px" }}>Coming up</h4>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {upcomingShown.map((e) => (
              <EventRow key={`${e.date}-${e.title}`} event={e} />
            ))}
          </ul>
        </>
      )}

      {pastShown.length > 0 && (
        <>
          <h4 style={{ margin: "14px 0 4px" }}>Recent</h4>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {pastShown.map((e) => (
              <EventRow key={`${e.date}-${e.title}`} event={e} />
            ))}
          </ul>
        </>
      )}

      {(hidden > 0 || showAll) && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          style={{
            marginTop: 8,
            background: "transparent",
            border: "none",
            color: "var(--color-link)",
            cursor: "pointer",
            padding: 0,
          }}
        >
          {showAll ? "Show less" : `Show all (${hidden} more)`}
        </button>
      )}
    </div>
  );
}
