import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getProperty, deleteProperty } from "../services/storage";
import { calculatePropertyAnalytics } from "../utils/propertyAnalyticsEngine";

import ExecutiveSummary from "../components/ExecutiveSummary";
import FinancialCentre from "../components/property/FinancialCentre";
import HealthReport from "../components/property/HealthReport";
import ExpenseBreakdown from "../components/property/ExpenseBreakdown";
import InvestmentBreakdown from "../components/property/InvestmentBreakdown";
import AIAdvisor from "../components/property/AIAdvisor";
import RiskAssessment from "../components/property/RiskAssessment";
import ForecastCard from "../components/property/ForecastCard";
import MonthlyCheckinCard from "../components/property/MonthlyCheckinCard";
import PerformanceTrendCard from "../components/property/PerformanceTrendCard";

const TABS = [
  { id: "overview", label: "Overview", icon: "🏠" },
  { id: "monthly", label: "Monthly", icon: "📝" },
  { id: "intelligence", label: "Intelligence", icon: "📊" },
  { id: "advisor", label: "Advisor", icon: "🧠" },
];

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(() => getProperty(id));
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setProperty(getProperty(id));
  }, [id]);

  if (!property) {
    return (
      <div className="page-container">
        <h2>Property not found.</h2>
        <Link to="/portfolio">← Back to Portfolio</Link>
      </div>
    );
  }

  const analytics = calculatePropertyAnalytics(property);

  function handleDelete() {
    if (!window.confirm("Delete this property?")) return;
    deleteProperty(id);
    navigate("/portfolio");
  }

  function refreshProperty() {
    setProperty(getProperty(id));
  }

  const monthlyCashflow = Number(analytics?.profit?.monthlyProfit || 0);
  const rentalYield = Number(analytics?.rentalYield?.grossYield || 0);
  const equity = Number(analytics?.equity?.equity || 0);

  const healthScore =
    Number(
      analytics?.health?.score ??
        analytics?.investmentHealth?.score ??
        analytics?.healthScore ??
        0
    ) || 0;

  const riskScore =
    Number(
      analytics?.risk?.score ??
        analytics?.riskAssessment?.score ??
        analytics?.riskScore ??
        0
    ) || 0;

  return (
    <div className="page-container">
      <Link to="/portfolio" className="page-subtitle">
        ← Back to Portfolio
      </Link>

      <div style={{ marginTop: 18 }}>
        <ExecutiveSummary property={property} analytics={analytics} />
      </div>

      <section
        style={{
          marginTop: 24,
          position: "sticky",
          top: 0,
          zIndex: 5,
          padding: "8px 0 12px",
          background: "var(--background, #0b0b10)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 8,
            padding: 6,
            borderRadius: 14,
            background: "#15171f",
            border: "1px solid #303544",
          }}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  border: "none",
                  borderRadius: 10,
                  padding: "11px 8px",
                  background: active ? "#263b62" : "transparent",
                  color: "inherit",
                  cursor: "pointer",
                  fontWeight: active ? 700 : 500,
                }}
              >
                <span style={{ display: "block", fontSize: 16 }}>
                  {tab.icon}
                </span>
                <span style={{ fontSize: 12 }}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {activeTab === "overview" && (
        <section style={{ marginTop: 10 }}>
          <section className="page-header">
            <p className="page-subtitle">PROPERTY OVERVIEW</p>
            <h2>Financial Position</h2>
            <p className="page-subtitle">
              A simple view of where the investment stands today.
            </p>
          </section>

          <FinancialCentre analytics={analytics} />

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(180px,1fr))",
              gap: 12,
              marginTop: 20,
            }}
          >
            <div
              className="card"
              style={{ padding: 16 }}
            >
              <div className="card-label">Health</div>
              <strong>
                {healthScore > 0 ? `${healthScore}/100` : "Available"}
              </strong>
            </div>

            <div
              className="card"
              style={{ padding: 16 }}
            >
              <div className="card-label">Risk</div>
              <strong>
                {riskScore > 0 ? riskScore : "Available"}
              </strong>
            </div>

            <div
              className="card"
              style={{ padding: 16 }}
            >
              <div className="card-label">Monthly Cashflow</div>
              <strong
                style={{
                  color: monthlyCashflow >= 0 ? "#22C55E" : "#F97316",
                }}
              >
                RM{" "}
                {monthlyCashflow.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </strong>
            </div>

            <div
              className="card"
              style={{ padding: 16 }}
            >
              <div className="card-label">Rental Yield</div>
              <strong>{rentalYield.toFixed(2)}%</strong>
            </div>

            <div
              className="card"
              style={{ padding: 16 }}
            >
              <div className="card-label">Equity</div>
              <strong>
                RM{" "}
                {equity.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </strong>
            </div>
          </div>
        </section>
      )}

      {activeTab === "monthly" && (
        <section style={{ marginTop: 10 }}>
          <section className="page-header">
            <p className="page-subtitle">INVESTMENT TRACKING</p>
            <h2>Monthly Performance</h2>
            <p className="page-subtitle">
              Record what happened and let Aequitas build the history.
            </p>
          </section>

          <MonthlyCheckinCard
            property={property}
            onSaved={refreshProperty}
          />

          <PerformanceTrendCard property={property} />
        </section>
      )}

      {activeTab === "intelligence" && (
        <section style={{ marginTop: 10 }}>
          <section className="page-header">
            <p className="page-subtitle">INVESTMENT INTELLIGENCE</p>
            <h2>Understand the Investment</h2>
            <p className="page-subtitle">
              These tools explain health, risk, forecast and the underlying
              numbers.
            </p>
          </section>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(340px,1fr))",
              gap: 20,
            }}
          >
            <HealthReport analytics={analytics} />
            <RiskAssessment analytics={analytics} />
            <ForecastCard analytics={analytics} />
            <ExpenseBreakdown property={property} />
            <InvestmentBreakdown property={property} />
          </div>
        </section>
      )}

      {activeTab === "advisor" && (
        <section style={{ marginTop: 10 }}>
          <section className="page-header">
            <p className="page-subtitle">AEQUITAS ADVISOR</p>
            <h2>What should I pay attention to?</h2>
            <p className="page-subtitle">
              Aequitas explains the signals instead of asking you to interpret
              every number yourself.
            </p>
          </section>

          <AIAdvisor analytics={analytics} property={property} />

          <div
            style={{
              marginTop: 18,
              padding: 16,
              borderRadius: 12,
              background: "#111827",
              border: "1px solid #273244",
            }}
          >
            <strong>Next step</strong>
            <p
              className="page-subtitle"
              style={{ marginBottom: 0, marginTop: 7, lineHeight: 1.55 }}
            >
              If a signal needs investigation, use Decision Lab to test a
              scenario before changing the investment strategy.
            </p>

            <button
              type="button"
              className="primary-button"
              style={{ marginTop: 12 }}
              onClick={() => navigate("/decision-lab")}
            >
              Open Decision Lab
            </button>
          </div>
        </section>
      )}

      <details
        style={{
          marginTop: 28,
          border: "1px solid #303544",
          borderRadius: 14,
          padding: "0 18px",
          background: "#11131A",
        }}
      >
        <summary
          style={{
            cursor: "pointer",
            padding: "18px 0",
            fontWeight: 600,
          }}
        >
          More property details
        </summary>

        <div style={{ paddingBottom: 18 }}>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>📅 Timeline</h3>

            {analytics.timeline.length === 0 ? (
              <p>No timeline events recorded.</p>
            ) : (
              <ul>
                {analytics.timeline.map((event, index) => (
                  <li key={index}>
                    <strong>{event.title}</strong> • {event.date}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              marginTop: 20,
            }}
          >
            <button
              className="primary-button"
              onClick={() => navigate(`/property/${id}/edit`)}
            >
              ✏ Edit Property
            </button>

            <button
              className="primary-button"
              style={{ background: "#B91C1C" }}
              onClick={handleDelete}
            >
              🗑 Delete Property
            </button>
          </div>
        </div>
      </details>

      <div style={{ height: 32 }} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <small className="page-subtitle">
          Latest position is based on saved property data and monthly check-ins.
        </small>

        <Link to="/portfolio" className="page-subtitle">
          ← Return to Portfolio
        </Link>
      </div>
    </div>
  );
}
