import { useMemo } from "react";

import StatusPill from "./StatusPill";
import { STATUS_TONE_BY_KEY, toneColor } from "../utils/statusTone";
import { assessProperty, RULES } from "../utils/assessmentEngine";
import { formatRM } from "../utils/propertyFinancials";

/*
 * Property Overview — "Understand"
 *
 * One status with its reasons, four key figures, and anything that needs
 * confirming. Replaces the numeric Investment Health score and the ROI /
 * capital growth figures that showed 0 when no valuation was recorded.
 */

function Figure({ label, value, note, color }) {
  return (
    <div>
      <div className="card-label">{label}</div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          marginTop: 6,
          color: color || "inherit",
        }}
      >
        {value}
      </div>
      {note && (
        <div className="page-subtitle" style={{ fontSize: 12, marginTop: 4 }}>
          {note}
        </div>
      )}
    </div>
  );
}

export default function ExecutiveSummary({ property }) {
  const assessment = useMemo(() => assessProperty(property), [property]);
  const { figures, statusMeta } = assessment;
  const purchaseBased = figures.valueSource !== "market";

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <p className="page-subtitle" style={{ margin: 0 }}>
            PROPERTY OVERVIEW
          </p>
          <h2 style={{ margin: "6px 0 0" }}>
            🏢 {property.projectName || "Investment Property"}
          </h2>
        </div>
        <StatusPill tone={statusMeta.tone} large>
          {statusMeta.label}
        </StatusPill>
      </div>

      {assessment.areas.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "18px 0 0",
            display: "grid",
            gap: 8,
          }}
        >
          {assessment.areas.map((area) => (
            <li
              key={area.key}
              style={{ display: "flex", gap: 10, lineHeight: 1.5 }}
            >
              <span
                style={{
                  color: toneColor(STATUS_TONE_BY_KEY[area.status]),
                  fontWeight: 700,
                  minWidth: 86,
                }}
              >
                {area.title}
              </span>
              <span>{area.text}</span>
            </li>
          ))}
        </ul>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
          gap: 20,
          marginTop: 24,
          paddingTop: 20,
          borderTop: "1px solid var(--color-border-strong)",
        }}
      >
        <Figure
          label="Monthly Cashflow"
          value={formatRM(figures.cashflow)}
          color={figures.cashflow >= 0 ? "var(--color-success)" : "var(--color-negative)"}
          note="Expected, after instalment and expenses"
        />
        <Figure
          label={purchaseBased ? "Equity (estimate)" : "Equity"}
          value={formatRM(figures.equity)}
          note={
            purchaseBased
              ? "Against purchase price; no valuation"
              : "Market value less loan"
          }
        />
        <Figure
          label="Loan-to-Value"
          value={
            figures.ltv === null ? "—" : `${(figures.ltv * 100).toFixed(1)}%`
          }
          note={purchaseBased ? "Against purchase price" : "Against market value"}
        />
        <Figure
          label="Gross Rental Yield"
          value={
            figures.grossYield === null
              ? "—"
              : `${figures.grossYield.toFixed(2)}%`
          }
          note="Annual rent ÷ purchase price"
        />
      </div>

      {assessment.toConfirm.length > 0 && (
        <div
          style={{
            marginTop: 20,
            padding: 14,
            borderRadius: 10,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-strong)",
          }}
        >
          <div className="card-label">TO CONFIRM</div>
          <ul
            className="page-subtitle"
            style={{ margin: "8px 0 0", paddingLeft: 20, lineHeight: 1.6 }}
          >
            {assessment.toConfirm.map((item) => (
              <li key={item.key}>{item.text}</li>
            ))}
          </ul>
        </div>
      )}

      <details style={{ marginTop: 16 }}>
        <summary className="page-subtitle" style={{ cursor: "pointer" }}>
          How Aequitas reaches this status
        </summary>
        <ul
          className="page-subtitle"
          style={{ margin: "10px 0 0", paddingLeft: 20, lineHeight: 1.6 }}
        >
          {RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
