import { Link } from "react-router-dom";

import Card from "../components/Card";
import ExecutiveBriefCard from "../components/cards/ExecutiveBriefCard";
import WelcomePanel from "../components/WelcomePanel";

import { getProperties } from "../services/storage";
import { calculateDashboard } from "../utils/dashboard";
import { generatePortfolioAttention } from "../utils/portfolioAttention";
import { assessPortfolio } from "../utils/assessmentEngine";
import { daysSinceBackup, getSettings } from "../services/settingsStorage";
import { getFreshness } from "../utils/freshnessEngine";
import formatCurrency from "../utils/formatCurrency";

export default function Home() {
  const properties = getProperties();
  const dashboard = calculateDashboard(properties);
  const portfolioStatus = assessPortfolio(properties);
  const backupAge = daysSinceBackup();
  const freshness = properties.map((p) => getFreshness(p));
  const backupReminderDays = getSettings().backupReminderDays;

  const equity = dashboard.totalValue - dashboard.totalLoan;
  const averageValue = dashboard.totalProperties > 0
    ? dashboard.totalValue / dashboard.totalProperties
    : 0;

  const attentionItems = generatePortfolioAttention(properties).slice(0, 3);

  const metrics = [
    { label: "Portfolio Value", value: dashboard.totalValue },
    { label: "Outstanding Loan", value: dashboard.totalLoan },
    { label: "Net Equity", value: equity },
    { label: "Monthly Rental", value: dashboard.totalRental },
  ];

  // First run: no properties yet.
  if (properties.length === 0) {
    return (
      <div className="page-container">
        <WelcomePanel />
      </div>
    );
  }

  return (
    <div className="page-container">
      <ExecutiveBriefCard portfolio={portfolioStatus} freshness={freshness} />

      {properties.length > 0 &&
        (backupAge === null || backupAge >= backupReminderDays) && (
          <Link
            to="/settings"
            style={{ color: "inherit", textDecoration: "none", display: "block", marginTop: 16 }}
          >
            <div
              role="status"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
                padding: "14px 18px",
                borderRadius: 14,
                border: "1px solid var(--color-warning-border)",
                background: "var(--color-warning-soft)",
              }}
            >
              <span>
                💾{" "}
                {backupAge === null
                  ? "You haven't downloaded a backup from Settings yet."
                  : `Your last backup was ${backupAge} days ago.`}{" "}
                Your data lives only in this browser.
              </span>
              <strong style={{ color: "var(--color-primary)" }}>Back up now →</strong>
            </div>
          </Link>
        )}

      <section style={{ marginTop: 20 }}>
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-text-secondary)",
              marginBottom: 5,
            }}
          >
            Portfolio snapshot
          </div>
          <div style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
            A quick view of your current portfolio position.
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 16,
          }}
        >
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                  marginBottom: 12,
                  whiteSpace: "nowrap",
                }}
              >
                {metric.label}
              </div>
              <div
                style={{
                  fontSize: 27,
                  lineHeight: 1.05,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                RM {formatCurrency(metric.value)}
              </div>
            </Card>
          ))}
        </div>

        <div
          style={{
            marginTop: 9,
            padding: "0 4px",
            color: "var(--color-text-secondary)",
            fontSize: 12,
          }}
        >
          {dashboard.totalProperties} {dashboard.totalProperties === 1 ? "property" : "properties"}
          {dashboard.totalProperties > 0 && (
            <>
              <span style={{ margin: "0 8px" }}>•</span>
              Average portfolio value: RM {formatCurrency(averageValue)}
            </>
          )}
        </div>

        {dashboard.valuedAtPurchasePrice.length > 0 && (
          <div
            style={{
              marginTop: 4,
              padding: "0 4px",
              color: "var(--color-text-secondary)",
              fontSize: 12,
            }}
          >
            Portfolio value and equity use the purchase price for{" "}
            {dashboard.valuedAtPurchasePrice.length === dashboard.totalProperties
              ? dashboard.totalProperties === 1
                ? "this property"
                : "all properties"
              : dashboard.valuedAtPurchasePrice.join(", ")}
            , as no market valuation has been recorded.
          </div>
        )}
      </section>

      {attentionItems.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 16,
                marginBottom: 18,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-text-secondary)",
                    marginBottom: 6,
                  }}
                >
                  Portfolio attention
                </div>
                <h3 style={{ margin: 0 }}>What needs attention</h3>
              </div>
              <Link to="/portfolio" style={{ fontSize: 13 }}>
                View portfolio →
              </Link>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {attentionItems.map((item, index) => (
                <div
                  key={`${item.title || "insight"}-${index}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "28px minmax(0, 1fr)",
                    gap: 10,
                    alignItems: "start",
                    paddingTop: index === 0 ? 0 : 14,
                    borderTop: index === 0 ? "none" : "1px solid var(--color-border-strong)",
                  }}
                >
                  <span style={{ fontSize: 18, lineHeight: 1.4 }}>
                    {item.emoji || "•"}
                  </span>
                  <div>
                    <Link to={item.link} style={{ color: "inherit" }}>
                      <strong>{item.title}</strong>
                    </Link>
                    {item.message && (
                      <p
                        style={{
                          margin: "5px 0 0",
                          color: "var(--color-text-secondary)",
                          lineHeight: 1.5,
                        }}
                      >
                        {item.message}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      <section style={{ marginTop: 24 }}>
        <Card>
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 12,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-text-secondary)",
                marginBottom: 6,
              }}
            >
              Continue
            </div>
            <h3 style={{ margin: 0 }}>Quick actions</h3>
          </div>

          <div className="action-panel">
            <Link to="/add">
              <button className="primary-button">+ Add Property</button>
            </Link>
            <Link to="/settings">
              <button className="btn-secondary" style={{ padding: "12px 18px", borderRadius: 12, fontWeight: 600, cursor: "pointer" }}>Backup &amp; restore</button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
