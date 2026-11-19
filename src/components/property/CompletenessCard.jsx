import { useMemo } from "react";
import { Link } from "react-router-dom";

import { getCompleteness } from "../../utils/completenessEngine";

/*
 * "Complete this property" — the optional details that unlock features,
 * with a link to where each is entered. Hidden once everything is done.
 */
export default function CompletenessCard({ property }) {
  const result = useMemo(() => getCompleteness(property), [property]);

  if (!result.missing.length) return null;

  const percent = Math.round((result.doneCount / result.total) * 100);

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
        <div>
          <div className="card-label">COMPLETE THIS PROPERTY</div>
          <h3 style={{ margin: "6px 0 0" }}>
            {result.doneCount} of {result.total} details added
          </h3>
        </div>
        <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
          Each one unlocks something specific
        </span>
      </div>

      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: "var(--color-track)",
          overflow: "hidden",
          margin: "14px 0 16px",
        }}
        aria-hidden="true"
      >
        <div style={{ width: `${percent}%`, height: "100%", background: "var(--color-primary)" }} />
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {result.missing.map((item) => (
          <div
            key={item.key}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 10,
              background: "var(--color-surface-sunken)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{item.label}</div>
              <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 2 }}>{item.why}</div>
            </div>
            <Link to={item.to}>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: "8px 14px", borderRadius: 10, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
              >
                {item.action}
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
