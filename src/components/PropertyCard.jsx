import { Link } from "react-router-dom";

import StatusPill from "./StatusPill";
import FreshnessBadge from "./FreshnessBadge";
import { formatRM } from "../utils/propertyFinancials";

/*
 * Portfolio property card — built around what the investor acts on:
 * status and its reason, the key figures, and whether this month's
 * check-in has been recorded.
 *
 * `assessment` comes from assessProperty(); `freshness` from getFreshness().
 */

function Figure({ label, value, note, color }) {
  return (
    <div>
      <div className="card-label">{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, color: color || "inherit" }}>
        {value}
      </div>
      {note && (
        <div style={{ fontSize: 12, marginTop: 2, color: "var(--color-text-muted)" }}>
          {note}
        </div>
      )}
    </div>
  );
}

export default function PropertyCard({ property, assessment, freshness }) {
  const { figures, statusMeta, concerns } = assessment;
  const purchaseBased = figures.valueSource !== "market";

  const reason = concerns.length
    ? concerns.map((c) => c.short).join(" and ")
    : statusMeta.label === "On track"
    ? "cashflow and leverage within range"
    : "";

  return (
    <div className="card" style={{ marginTop: 14, display: "grid", gap: 18 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Link
            to={`/property/${property.id}`}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            <h3 style={{ margin: 0 }}>🏢 {property.projectName || "Unnamed property"}</h3>
          </Link>
          {reason && (
            <div style={{ marginTop: 6, fontSize: 14, color: "var(--color-text-secondary)" }}>
              {reason.charAt(0).toUpperCase() + reason.slice(1)}
            </div>
          )}
        </div>
        <StatusPill tone={statusMeta.tone}>{statusMeta.label}</StatusPill>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
          gap: 16,
        }}
      >
        <Figure
          label={purchaseBased ? "Value (purchase price)" : "Market value"}
          value={formatRM(figures.value)}
        />
        <Figure label="Outstanding loan" value={formatRM(figures.loan)} />
        <Figure
          label="Monthly cashflow"
          value={formatRM(figures.cashflow)}
          color={figures.cashflow >= 0 ? "var(--color-success)" : "var(--color-negative)"}
        />
        <Figure
          label="Loan-to-value"
          value={figures.ltv === null ? "—" : `${(figures.ltv * 100).toFixed(0)}%`}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          paddingTop: 14,
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <FreshnessBadge freshness={freshness} showNextDue />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to={`/property/${property.id}?tab=monthly`}>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: "10px 16px", borderRadius: 12, fontWeight: 600, cursor: "pointer" }}
            >
              Record check-in
            </button>
          </Link>
          <Link to={`/property/${property.id}`}>
            <button type="button" className="primary-button" style={{ width: "auto", padding: "10px 16px" }}>
              View →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
