import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getProperty } from "../services/storage";
import MonthlyCheckinCard from "../components/property/MonthlyCheckinCard";
import PerformanceTrendCard from "../components/property/PerformanceTrendCard";

const tabs = [
  { id: "overview", label: "Overview", description: "Understand" },
  { id: "monthly", label: "Monthly", description: "Record" },
  { id: "intelligence", label: "Intelligence", description: "Investigate" },
  { id: "advisor", label: "Advisor", description: "Interpret" },
];

export default function PropertyMonthly() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(() => getProperty(id));

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

  function refreshProperty() {
    setProperty(getProperty(id));
  }

  function goToTab(tabId) {
    if (tabId === "overview") {
      navigate(`/property/${id}`);
      return;
    }

    if (tabId === "monthly") {
      navigate(`/property/${id}/monthly`);
      return;
    }

    // Intelligence and Advisor still live in the existing Property Details
    // workspace for now. The next refactor can give them dedicated routes.
    navigate(`/property/${id}?tab=${tabId}`);
  }

  return (
    <div className="page-container">
      <Link to="/portfolio" className="page-subtitle">
        ← Back to Portfolio
      </Link>

      <div style={{ marginTop: 14 }}>
        <div className="page-header">
          <p className="page-subtitle" style={{ marginBottom: 4 }}>
            PROPERTY
          </p>
          <h1 style={{ marginTop: 0 }}>
            {property.projectName || "Unnamed Property"}
          </h1>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,minmax(0,1fr))",
            gap: 8,
            marginTop: 20,
            padding: 6,
            border: "1px solid var(--color-border-strong)",
            borderRadius: 16,
            background: "var(--color-surface-sunken)",
          }}
        >
          {tabs.map((tab) => {
            const active = tab.id === "monthly";

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => goToTab(tab.id)}
                style={{
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 8px",
                  background: active ? "var(--color-surface-elevated)" : "transparent",
                  color: active ? "var(--color-text)" : "var(--color-text-secondary)",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  {tab.label}
                </div>
                <div
                  style={{
                    marginTop: 3,
                    fontSize: 11,
                    opacity: 0.8,
                  }}
                >
                  {tab.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <section className="page-header" style={{ marginTop: 24 }}>
        <p className="page-subtitle" style={{ marginBottom: 4 }}>
          RECORD
        </p>

        <h2 style={{ marginTop: 0, marginBottom: 8 }}>
          Monthly Check-in
        </h2>

        <p
          className="page-subtitle"
          style={{
            maxWidth: 720,
            lineHeight: 1.6,
            marginBottom: 0,
          }}
        >
          Record what actually happened this month. Aequitas keeps the
          history so changes in rental income, costs, loan balance and
          property value can be understood over time.
        </p>
      </section>

      <section
        style={{
          marginTop: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 12,
        }}
      >
        <div className="card">
          <div className="card-label">PROPERTY</div>
          <strong>{property.projectName || "Unnamed Property"}</strong>
        </div>

        <div className="card">
          <div className="card-label">CURRENT RENTAL</div>
          <strong>
            RM{" "}
            {Number(property.monthlyRental || 0).toLocaleString("en-MY", {
              maximumFractionDigits: 0,
            })}
          </strong>
        </div>

        <div className="card">
          <div className="card-label">CURRENT LOAN PAYMENT</div>
          <strong>
            RM{" "}
            {Number(property.monthlyInstalment || 0).toLocaleString("en-MY", {
              maximumFractionDigits: 0,
            })}
          </strong>
        </div>
      </section>

      <section style={{ marginTop: 20 }}>
        <MonthlyCheckinCard
          property={property}
          onSaved={refreshProperty}
        />
      </section>

      <section style={{ marginTop: 28 }}>
        <div className="page-header">
          <p className="page-subtitle" style={{ marginBottom: 4 }}>
            HISTORY
          </p>
          <h2 style={{ marginTop: 0 }}>Performance over time</h2>
          <p className="page-subtitle">
            Record several months before drawing conclusions from a trend.
          </p>
        </div>

        <PerformanceTrendCard property={property} />
      </section>

      <section
        style={{
          marginTop: 28,
          padding: 18,
          border: "1px solid var(--color-border-strong)",
          borderRadius: 14,
          background: "var(--color-surface)",
        }}
      >
        <div className="card-label">NEXT</div>
        <h3 style={{ margin: "6px 0" }}>Investigate the investment</h3>
        <p className="page-subtitle" style={{ marginBottom: 14 }}>
          Once your monthly history is recorded, use Investment Intelligence
          and Advisor to understand what is changing.
        </p>

        <button
          type="button"
          className="primary-button"
          onClick={() => navigate(`/property/${id}?tab=intelligence`)}
        >
          Open Investment Intelligence
        </button>
      </section>

      <div style={{ height: 32 }} />
    </div>
  );
}
