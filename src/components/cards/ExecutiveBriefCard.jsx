import { Link } from "react-router-dom";

import StatusPill from "../StatusPill";
import { STATUS_TONE_BY_KEY, toneColor } from "../../utils/statusTone";
import { getSettings } from "../../services/settingsStorage";
import { relativeDays } from "../../utils/freshnessEngine";

function greeting(now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/*
 * Home — Executive Brief
 *
 * Restores the preferred top-of-Home layout (Executive Brief, date,
 * portfolio status, short message, View Portfolio) but replaces the old
 * points-based Portfolio Score with a status and its reasons, taken from
 * the shared assessment engine.
 *
 * `portfolio` is the result of assessPortfolio().
 */
export default function ExecutiveBriefCard({ portfolio, freshness = [] }) {
  const date = new Date().toLocaleDateString("en-MY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const count = portfolio.assessments.length;
  const name = getSettings().investorName.trim();

  // "Last checked in" across the portfolio.
  const lastDays = freshness
    .map((f) => f.daysSinceEntry)
    .filter((d) => d !== null)
    .reduce((min, d) => (min === null || d < min ? d : min), null);
  const notCurrent = freshness.filter((f) => f.status !== "up-to-date").length;
  const nextDue = freshness
    .filter((f) => f.status === "up-to-date")
    .map((f) => f.nextDue)
    .sort((a, b) => a - b)[0];
  const checkinLine =
    lastDays === null
      ? "No check-ins recorded yet"
      : `Last check-in ${relativeDays(lastDays)}` +
        (notCurrent > 0
          ? ` · ${notCurrent} ${notCurrent === 1 ? "property needs" : "properties need"} a check-in`
          : nextDue
          ? ` · next due ${nextDue.toLocaleDateString("en-MY", { day: "numeric", month: "short" })}`
          : "");
  const tone = portfolio.statusMeta.tone;

  return (
    <div className="card" style={{ padding: 28 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-text-secondary)",
            }}
          >
            Executive Brief
          </div>
          <h2 style={{ margin: "8px 0 0" }}>
            {greeting()}
            {name ? `, ${name}` : ""}
          </h2>
          <div style={{ color: "var(--color-text-secondary)", fontSize: 14, marginTop: 4 }}>
            {date}
          </div>
          {count > 0 && (
            <div style={{ color: "var(--color-text-secondary)", fontSize: 13, marginTop: 6 }}>
              {count} {count === 1 ? "property" : "properties"}
              {portfolio.flaggedCount > 0 &&
                ` · ${portfolio.flaggedCount} to ${
                  portfolio.status === "review" ? "review" : "watch"
                }`}
            </div>
          )}
          {count > 0 && (
            <div
              style={{
                fontSize: 13,
                marginTop: 4,
                color: notCurrent > 0 ? "var(--color-warning)" : "var(--color-text-secondary)",
              }}
            >
              📝 {checkinLine}
            </div>
          )}
        </div>

        <div style={{ textAlign: "left", display: "grid", justifyItems: "start" }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-text-secondary)",
              marginBottom: 8,
            }}
          >
            Portfolio status
          </div>
          <StatusPill tone={tone} large>
            {portfolio.statusMeta.label}
          </StatusPill>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid var(--color-border)",
          marginTop: 22,
          paddingTop: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ maxWidth: 640 }}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55 }}>
            {portfolio.message}
          </p>

          {portfolio.assessments
            .filter((a) => a.concerns.length > 0)
            .map((a) => (
              <ul
                key={a.id}
                style={{
                  margin: "10px 0 0",
                  paddingLeft: 0,
                  listStyle: "none",
                  display: "grid",
                  gap: 4,
                }}
              >
                {a.concerns.map((c) => (
                  <li key={c.key} style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                    <span
                      style={{
                        color: toneColor(STATUS_TONE_BY_KEY[c.status]),
                        fontWeight: 700,
                        marginRight: 6,
                      }}
                    >
                      {c.title}
                    </span>
                    {c.text}
                  </li>
                ))}
              </ul>
            ))}
        </div>

        {count > 0 ? (
          <Link to="/portfolio">
            <button className="primary-button" style={{ width: "auto" }}>
              View Portfolio
            </button>
          </Link>
        ) : (
          <Link to="/add">
            <button className="primary-button" style={{ width: "auto" }}>
              + Add Property
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
