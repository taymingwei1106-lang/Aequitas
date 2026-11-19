import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  getProperty,
  deleteProperty,
  updateProperty,
} from "../services/storage";
import { getMonthlyCheckins } from "../services/monthlyCheckinStorage";
import {
  findRecordMismatch,
  formatMonth,
  formatRM,
} from "../utils/propertyFinancials";
import ErrorBoundary from "../components/ErrorBoundary";
import { calculatePropertyAnalytics } from "../utils/propertyAnalyticsEngine";

import ExecutiveSummary from "../components/ExecutiveSummary";
import FinancialCentre from "../components/property/FinancialCentre";
import ExpenseBreakdown from "../components/property/ExpenseBreakdown";
import InvestmentBreakdown from "../components/property/InvestmentBreakdown";
import AIAdvisor from "../components/property/AIAdvisor";
import ForecastCard from "../components/property/ForecastCard";
import MonthlyCheckinCard from "../components/property/MonthlyCheckinCard";
import CompletenessCard from "../components/property/CompletenessCard";
import PropertyTimeline from "../components/property/PropertyTimeline";
import DocumentsCard from "../components/property/DocumentsCard";
import YearlyBillsCard from "../components/property/YearlyBillsCard";
import TenantCard from "../components/property/TenantCard";
import { removeFilesForProperty } from "../services/fileStore";
import FreshnessBadge from "../components/FreshnessBadge";
import { getFreshness } from "../utils/freshnessEngine";
import PerformanceTrendCard from "../components/property/PerformanceTrendCard";
import LoanCard from "../components/property/LoanCard";

const tabs = [
  {
    id: "overview",
    label: "Overview",
    description: "Understand",
  },
  {
    id: "monthly",
    label: "Monthly",
    description: "Record",
  },
  {
    id: "intelligence",
    label: "Intelligence",
    description: "Investigate",
  },
  {
    id: "advisor",
    label: "Advisor",
    description: "Interpret",
  },
];

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(() => getProperty(id));
  // Allow links such as /property/123?tab=monthly to open a specific tab.
  const [searchParams] = useSearchParams();
  const requestedTab = ["overview", "monthly", "intelligence", "advisor"].includes(
    searchParams.get("tab")
  )
    ? searchParams.get("tab")
    : "overview";
  const [activeTab, setActiveTab] = useState(requestedTab);
  const [reconcileDismissed, setReconcileDismissed] = useState(false);
  const justAdded = searchParams.get("added") === "1";

  // Links such as ?tab=monthly#documents, #tenant or #yearly-bills scroll to that section.
  useEffect(() => {
    const target = window.location.hash.slice(1);
    if (activeTab !== "monthly" || !["documents", "yearly-bills", "tenant", "checkin"].includes(target)) return;
    const timer = setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => clearTimeout(timer);
  }, [activeTab]);

  useEffect(() => {
    setProperty(getProperty(id));
  }, [id]);

  useEffect(() => {
    setActiveTab(requestedTab);
    // Reset only when moving to a different property.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  /*
   * Surface (never silently fix) a difference between the property record
   * and its latest check-in. The user decides whether to update the record.
   */
  const checkins = getMonthlyCheckins(property.id);
  const loanMismatch = findRecordMismatch(
    property,
    checkins,
    "outstandingLoan",
    "outstandingLoan"
  );
  const valueMismatch = (() => {
    const mismatch = findRecordMismatch(
      property,
      checkins,
      "marketValue",
      "marketValue"
    );
    return mismatch && mismatch.checkinValue > 0 ? mismatch : null;
  })();

  function applyCheckinToRecord() {
    const update = {};
    if (loanMismatch) update.outstandingLoan = loanMismatch.checkinValue;
    if (valueMismatch) update.marketValue = valueMismatch.checkinValue;
    updateProperty(id, update);
    refreshProperty();
  }

  async function handleDelete() {
    if (
      !window.confirm(
        "Delete this property?\n\nThe property and any documents saved for it on this device will be removed. Download a backup first if you may need them."
      )
    )
      return;
    deleteProperty(id);
    // Files belong to the property; leaving them would use space with no way to reach them.
    await removeFilesForProperty(id).catch(() => {});
    navigate("/portfolio");
  }

  function refreshProperty() {
    setProperty(getProperty(id));
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
          <h1 style={{ marginTop: 0, marginBottom: 8 }}>
            {property.projectName || "Unnamed Property"}
          </h1>
          <FreshnessBadge freshness={getFreshness(property)} showNextDue />
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
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
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
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
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

      {(loanMismatch || valueMismatch) && !reconcileDismissed && (
        <section
          role="status"
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 14,
            border: "1px solid var(--color-warning-border)",
            background: "rgba(245,158,11,0.08)",
          }}
        >
          <strong>Property record differs from the latest check-in</strong>
          <ul className="page-subtitle" style={{ margin: "8px 0 0", paddingLeft: 20, lineHeight: 1.6 }}>
            {loanMismatch && (
              <li>
                Outstanding loan: record shows{" "}
                {loanMismatch.recordValue === null
                  ? "nothing"
                  : formatRM(loanMismatch.recordValue, 2)}
                ; {formatMonth(loanMismatch.month)} check-in shows{" "}
                {formatRM(loanMismatch.checkinValue, 2)}.
                {loanMismatch.recordValue !== null &&
                  loanMismatch.checkinValue > loanMismatch.recordValue &&
                  " The check-in figure is higher, so confirm it against your loan statement first."}
              </li>
            )}
            {valueMismatch && (
              <li>
                Market value: record shows{" "}
                {valueMismatch.recordValue === null
                  ? "nothing"
                  : formatRM(valueMismatch.recordValue)}
                ; {formatMonth(valueMismatch.month)} check-in shows{" "}
                {formatRM(valueMismatch.checkinValue)}.
              </li>
            )}
          </ul>
          <p className="page-subtitle" style={{ margin: "8px 0 12px", fontSize: 13 }}>
            Equity and loan figures use the property record. Updating it copies
            the check-in figures above; nothing else changes.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="primary-button"
              style={{ width: "auto" }}
              onClick={applyCheckinToRecord}
            >
              Update property record
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: "12px 18px", borderRadius: 12, fontWeight: 600, cursor: "pointer" }}
              onClick={() => setReconcileDismissed(true)}
            >
              Not now
            </button>
          </div>
        </section>
      )}

      {activeTab === "overview" && (
        <ErrorBoundary label="Overview" resetKey={activeTab}>
        <div style={{ marginTop: 24 }}>
          <ExecutiveSummary property={property} />

          <CompletenessCard property={property} />

          <PropertyTimeline property={property} />

          <section
            style={{
              marginTop: 24,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
              gap: 12,
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("monthly")}
              className="card"
              style={{
                textAlign: "left",
                cursor: "pointer",
                color: "inherit",
                border: "1px solid var(--color-border-strong)",
              }}
            >
              <div className="card-label">NEXT</div>
              <h3 style={{ margin: "6px 0" }}>📝 Monthly Check-in</h3>
              <p className="page-subtitle" style={{ margin: 0 }}>
                Record what actually happened and build your performance history.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("intelligence")}
              className="card"
              style={{
                textAlign: "left",
                cursor: "pointer",
                color: "inherit",
                border: "1px solid var(--color-border-strong)",
              }}
            >
              <div className="card-label">NEXT</div>
              <h3 style={{ margin: "6px 0" }}>📊 Investment Intelligence</h3>
              <p className="page-subtitle" style={{ margin: 0 }}>
                See what is changing, how your loan is being repaid, and what the
                investment cost.
              </p>
            </button>

            <Link
              to={`/property/${id}/report`}
              className="card"
              style={{
                textAlign: "left",
                color: "inherit",
                textDecoration: "none",
                border: "1px solid var(--color-border-strong)",
              }}
            >
              <div className="card-label">SHARE</div>
              <h3 style={{ margin: "6px 0" }}>📄 Property report</h3>
              <p className="page-subtitle" style={{ margin: 0 }}>
                A one-page summary to save as PDF for a bank, a partner or your records.
              </p>
            </Link>
          </section>
        </div>
        </ErrorBoundary>
      )}

      {activeTab === "monthly" && (
        <ErrorBoundary label="Monthly" resetKey={activeTab}>
        <div style={{ marginTop: 24 }}>
          <section className="page-header">
            <p className="page-subtitle">RECORD</p>
            <h2>Monthly records</h2>
            <p className="page-subtitle">
              This month&apos;s figures, your tenant, yearly bills and documents.
            </p>
          </section>

          {justAdded && (
            <div
              role="status"
              style={{
                marginBottom: 16,
                padding: 14,
                borderRadius: 12,
                border: "1px solid var(--color-success-border)",
                background: "var(--color-success-soft)",
              }}
            >
              ✓ <strong>{property.projectName}</strong> has been added. Record this month&apos;s
              check-in below to start building its history, or come back to it later.
            </div>
          )}

          <MonthlyCheckinCard
            key={property.id}
            property={property}
            onSaved={refreshProperty}
          />

          <TenantCard property={property} onSaved={refreshProperty} />

          <YearlyBillsCard property={property} onSaved={refreshProperty} />

          <DocumentsCard property={property} onSaved={refreshProperty} />

          <button
            type="button"
            onClick={() => setActiveTab("intelligence")}
            className="card"
            style={{
              marginTop: 24,
              width: "100%",
              textAlign: "left",
              cursor: "pointer",
              color: "inherit",
              border: "1px solid var(--color-border-strong)",
            }}
          >
            <div className="card-label">NEXT</div>
            <h3 style={{ margin: "6px 0" }}>📈 What is changing?</h3>
            <p className="page-subtitle" style={{ margin: 0 }}>
              See how your recorded months compare in the Intelligence tab.
            </p>
          </button>
        </div>
        </ErrorBoundary>
      )}

      {activeTab === "intelligence" && (
        <ErrorBoundary label="Intelligence" resetKey={activeTab}>
        <div style={{ marginTop: 24 }}>
          <section className="page-header">
            <p className="page-subtitle">INVESTIGATE</p>
            <h2>Investment Intelligence</h2>
            <p className="page-subtitle">
              What is changing month to month, your financial position, your loan, and what the investment cost.
            </p>
          </section>

          <PerformanceTrendCard property={property} />

          <div style={{ marginTop: 24 }}>
            <FinancialCentre property={property} />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(340px,1fr))",
              gap: 24,
              marginTop: 20,
            }}
          >
            <LoanCard property={property} />
            <ForecastCard analytics={analytics} />
            <ExpenseBreakdown property={property} />
            <InvestmentBreakdown property={property} />
          </div>
        </div>
        </ErrorBoundary>
      )}

      {activeTab === "advisor" && (
        <ErrorBoundary label="Advisor" resetKey={activeTab}>
        <div style={{ marginTop: 24 }}>
          <section className="page-header">
            <p className="page-subtitle">INTERPRET</p>
            <h2>Aequitas Advisor</h2>
            <p className="page-subtitle">
              Understand what the recent data may mean, why Aequitas is highlighting it, and what could change the picture.
            </p>
          </section>

          <AIAdvisor
            analytics={analytics}
            property={property}
          />

          <section
            style={{
              marginTop: 24,
              padding: 18,
              border: "1px solid var(--color-border-strong)",
              borderRadius: 14,
              background: "var(--color-surface)",
            }}
          >
            <div className="card-label">DEEPER ANALYSIS</div>
            <h3 style={{ margin: "6px 0" }}>🔬 Decision Lab</h3>
            <p className="page-subtitle" style={{ marginBottom: 14 }}>
              Test financing, rent, maintenance, property value and exit scenarios using this property's data.
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={() => navigate(`/decision-lab?property=${id}`)}
            >
              Open Decision Lab
            </button>
          </section>
        </div>
        </ErrorBoundary>
      )}

      <details
        style={{
          marginTop: 28,
          border: "1px solid var(--color-border-strong)",
          borderRadius: 14,
          padding: "0 18px",
          background: "var(--color-surface-sunken)",
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
              style={{ background: "var(--color-danger)" }}
              onClick={handleDelete}
            >
              🗑 Delete Property
            </button>
          </div>
        </div>
      </details>

      <div style={{ height: 32 }} />

      <hr
        style={{
          marginTop: 32,
          marginBottom: 24,
          border: "none",
          borderTop: "1px solid var(--color-border-strong)",
        }}
      />

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
          Latest position is based on your saved property data and monthly check-ins.
        </small>

        <Link to="/portfolio" className="page-subtitle">
          ← Return to Portfolio
        </Link>
      </div>
    </div>
  );
}
