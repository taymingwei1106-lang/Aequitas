import StatusPill from "./StatusPill";
import { relativeDays } from "../utils/freshnessEngine";

/*
 * Compact "last checked in" line: status pill plus when the last check-in
 * was entered. `freshness` comes from getFreshness().
 */
export default function FreshnessBadge({ freshness, showNextDue = false }) {
  const when =
    freshness.enteredAt && freshness.daysSinceEntry !== null
      ? relativeDays(freshness.daysSinceEntry)
      : null;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <StatusPill tone={freshness.tone}>{freshness.label}</StatusPill>
      <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
        {when ? `Last check-in ${when}` : "No check-ins yet"}
        {showNextDue && freshness.status === "up-to-date" && (
          <>
            {" · next due "}
            {freshness.nextDue.toLocaleDateString("en-MY", { day: "numeric", month: "short" })}
          </>
        )}
      </span>
    </span>
  );
}
