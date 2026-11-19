import { useMemo } from "react";

import { calculatePerformanceIntelligence } from "../../utils/PerformanceIntelligenceEngine";
import { buildAdvisorReport } from "../../utils/advisorEngine";
import { getMonthlyCheckins } from "../../services/monthlyCheckinStorage";
import { formatMonth, formatRM } from "../../utils/propertyFinancials";

const TONE = {
  positive: { color: "var(--color-success)", background: "rgba(34,197,94,0.12)" },
  negative: { color: "var(--color-negative)", background: "rgba(249,115,22,0.12)" },
  neutral: { color: "var(--color-text)", background: "rgba(203,213,225,0.10)" },
};

function SectionLabel({ children }) {
  return (
    <div
      className="page-subtitle"
      style={{
        fontSize: 12,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function buildReport(property) {
  try {
    const performance = calculatePerformanceIntelligence(property);
    const checkins = getMonthlyCheckins(property.id);
    return { report: buildAdvisorReport(property, performance, checkins) };
  } catch (error) {
    // The Advisor must never take the page down with it.
    console.error("Aequitas Advisor could not build its report:", error);
    return { report: null };
  }
}

export default function AIAdvisor({ property }) {
  const { report } = useMemo(() => buildReport(property), [property]);

  if (!report) {
    return (
      <div className="card">
        <h3 style={{ marginTop: 0 }}>🧠 Aequitas Advisor</h3>
        <p className="page-subtitle" style={{ marginBottom: 0 }}>
          The Advisor couldn't interpret this property's data right now. The
          Overview and Monthly tabs are unaffected. If this keeps happening,
          check the property's figures for unusual entries.
        </p>
      </div>
    );
  }

  const tone = TONE[report.status.tone] || TONE.neutral;

  return (
    <div className="card" style={{ display: "grid", gap: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ margin: 0 }}>🧠 Aequitas Advisor</h3>
        <span
          style={{
            padding: "6px 12px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 600,
            color: tone.color,
            background: tone.background,
          }}
        >
          {report.status.label}
        </span>
      </div>

      <section>
        <SectionLabel>What is happening</SectionLabel>
        <div style={{ display: "grid", gap: 10 }}>
          {report.happening.map((text, index) => (
            <p key={index} style={{ margin: 0, lineHeight: 1.6 }}>
              {text}
            </p>
          ))}
        </div>
      </section>

      {report.attention.length > 0 && (
        <section>
          <SectionLabel>What deserves attention</SectionLabel>
          <div style={{ display: "grid", gap: 10 }}>
            {report.attention.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                style={{
                  padding: 14,
                  borderRadius: 10,
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border-strong)",
                }}
              >
                <strong>{item.title}</strong>
                <p
                  className="page-subtitle"
                  style={{ margin: "6px 0 0", lineHeight: 1.55 }}
                >
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionLabel>What to monitor next</SectionLabel>
        <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6 }}>
          {report.monitor.map((text, index) => (
            <li key={index} style={{ lineHeight: 1.55 }}>
              {text}
            </li>
          ))}
        </ul>
      </section>

      <details>
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>
          Why is Aequitas saying this?
        </summary>

        <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
          <ul
            className="page-subtitle"
            style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6 }}
          >
            {report.why.basis.map((text, index) => (
              <li key={index} style={{ lineHeight: 1.55 }}>
                {text}
              </li>
            ))}
          </ul>

          {report.why.months.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr className="page-subtitle" style={{ textAlign: "right" }}>
                    <th style={{ textAlign: "left", padding: "6px 8px" }}>
                      Month
                    </th>
                    <th style={{ padding: "6px 8px" }}>Rent</th>
                    <th style={{ padding: "6px 8px" }}>Instalment</th>
                    <th style={{ padding: "6px 8px" }}>Expenses</th>
                    <th style={{ padding: "6px 8px" }}>Cashflow</th>
                    <th style={{ padding: "6px 8px" }}>Loan balance</th>
                  </tr>
                </thead>
                <tbody>
                  {report.why.months.map((m) => (
                    <tr
                      key={m.month}
                      style={{
                        borderTop: "1px solid var(--color-border-strong)",
                        textAlign: "right",
                      }}
                    >
                      <td style={{ textAlign: "left", padding: "8px" }}>
                        {formatMonth(m.month)}
                        {m.note && (
                          <div className="page-subtitle" style={{ fontSize: 11 }}>
                            {m.note}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: 8 }}>{formatRM(m.rental)}</td>
                      <td style={{ padding: 8 }}>{formatRM(m.instalment)}</td>
                      <td style={{ padding: 8 }}>{formatRM(m.expenses, 2)}</td>
                      <td
                        style={{
                          padding: 8,
                          color: m.cashflow >= 0 ? "var(--color-success)" : "var(--color-negative)",
                        }}
                      >
                        {formatRM(m.cashflow, 2)}
                      </td>
                      <td style={{ padding: 8 }}>
                        {m.loan === null ? "—" : formatRM(m.loan, 2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </details>

      <p className="page-subtitle" style={{ margin: 0, fontSize: 12 }}>
        Aequitas explains your recorded figures. It does not recommend buying,
        selling or refinancing; those decisions also depend on your objectives,
        financing terms and costs.
      </p>
    </div>
  );
}
