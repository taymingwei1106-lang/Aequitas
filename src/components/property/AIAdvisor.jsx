import React, { useMemo, useState } from "react";
import * as performanceEngine from "../../utils/performanceIntelligenceEngine";

export default function AIAdvisor({ analytics, property }) {
  const [showWhy, setShowWhy] = useState(false);

  const cashflow = Number(analytics?.profit?.monthlyProfit || 0);
  const yieldValue = Number(analytics?.rentalYield?.grossYield || 0);
  const equity = Number(analytics?.equity?.equity || 0);
  const marketValue = Number(analytics?.equity?.market || 0);
  const purchaseValue = Number(analytics?.investment?.purchasePrice || 0);
  const growth = marketValue - purchaseValue;

  const performance = useMemo(() => {
    if (!property?.id) return null;

const calculatePerformanceIntelligence =
  performanceEngine.calculatePerformanceIntelligence;

    if (typeof calculatePerformanceIntelligence !== "function") {
      return null;
    }

    try {
      return calculatePerformanceIntelligence(property.id);
    } catch {
      return null;
    }
  }, [property?.id]);

  const hasHistory = Boolean(
    performance?.monthsRecorded >= 3 ||
      performance?.recordsCount >= 3 ||
      performance?.summary
  );

  const overallTrend = performance?.overallTrend || "stable";

  let recommendation = "Continue monitoring this investment.";

  if (hasHistory) {
    if (overallTrend === "weakening") {
      recommendation =
        "Review the recent performance before making a major change.";
    } else if (overallTrend === "improving") {
      recommendation =
        "Continue monitoring. Recent performance is improving.";
    } else {
      recommendation =
        "Continue monitoring. Recent performance is broadly stable.";
    }
  } else if (cashflow < 0) {
    recommendation =
      "Review expenses or rental income before considering a major strategy change.";
  } else if (cashflow >= 0 && growth > 0) {
    recommendation =
      "Continue monitoring. The current snapshot is positive, but longer-term history should guide major decisions.";
  }

  const movements = performance?.movements || performance?.metrics || {};

  const getMovement = (key) => {
    const value = movements?.[key];

    if (typeof value === "number") return value;
    if (typeof value?.change === "number") return value.change;
    if (typeof value?.movement === "number") return value.movement;

    return null;
  };

  const formatMovement = (value) => {
    if (value === null || value === undefined) return "Not enough history";
    const sign = value > 0 ? "+" : "";
    return `${sign}RM ${Math.round(value).toLocaleString()}`;
  };

  const trendLabel =
    overallTrend === "improving"
      ? "Improving"
      : overallTrend === "weakening"
        ? "Weakening"
        : "Stable";

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>🧠 Aequitas Advisor</h3>

      <p>
        Overall, this investment is{" "}
        <strong>
          {cashflow >= 0
            ? "generating positive monthly cashflow"
            : "currently operating at a monthly loss"}
        </strong>
        .
      </p>

      <p>
        Rental yield currently stands at{" "}
        <strong>{yieldValue.toFixed(2)}%</strong>.
      </p>

      <p>
        Current equity has reached{" "}
        <strong>RM {Math.round(equity).toLocaleString()}</strong>.
      </p>

      <p>
        Capital appreciation currently totals{" "}
        <strong>RM {Math.round(growth).toLocaleString()}</strong>.
      </p>

      {hasHistory && (
        <div
          style={{
            marginTop: 18,
            padding: 16,
            borderRadius: 12,
            background: "#111827",
            border: "1px solid #273244",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            RECENT PERFORMANCE
          </div>

          <div style={{ marginTop: 6, fontSize: 18, fontWeight: 700 }}>
            {trendLabel}
          </div>

          {performance?.summary && (
            <p style={{ marginBottom: 0, marginTop: 8 }}>
              {performance.summary}
            </p>
          )}
        </div>
      )}

      <div
        style={{
          marginTop: 24,
          padding: 18,
          borderRadius: 12,
          background: "#1D2533",
        }}
      >
        <strong>What Aequitas is saying</strong>
        <p style={{ marginBottom: 0, marginTop: 10 }}>{recommendation}</p>
      </div>

      <button
        type="button"
        onClick={() => setShowWhy((value) => !value)}
        style={{
          marginTop: 14,
          padding: "10px 14px",
          borderRadius: 8,
          border: "1px solid #39465b",
          background: "transparent",
          color: "inherit",
          cursor: "pointer",
        }}
      >
        {showWhy ? "Hide explanation" : "Why is Aequitas saying this?"}
      </button>

      {showWhy && (
        <div
          style={{
            marginTop: 14,
            padding: 16,
            borderRadius: 12,
            background: "#111827",
            border: "1px solid #273244",
          }}
        >
          {hasHistory ? (
            <>
              <p style={{ marginTop: 0 }}>
                Aequitas is using the property's recorded monthly history to
                look for movement rather than relying only on today's snapshot.
              </p>

              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <strong>Cashflow</strong>
                  <div>{formatMovement(getMovement("cashflow"))}</div>
                </div>

                <div>
                  <strong>Rental income</strong>
                  <div>{formatMovement(getMovement("rental"))}</div>
                </div>

                <div>
                  <strong>Loan balance</strong>
                  <div>{formatMovement(getMovement("loanBalance"))}</div>
                </div>

                <div>
                  <strong>Maintenance & expenses</strong>
                  <div>
                    {formatMovement(getMovement("maintenanceExpenses"))}
                  </div>
                </div>

                <div>
                  <strong>Market value</strong>
                  <div>{formatMovement(getMovement("marketValue"))}</div>
                </div>
              </div>
            </>
          ) : (
            <p style={{ margin: 0 }}>
              There is not enough monthly history yet to identify a reliable
              performance trend. Aequitas is therefore using the current
              cashflow and investment snapshot only.
            </p>
          )}
        </div>
      )}

      <div
        style={{
          marginTop: 20,
          padding: 16,
          borderRadius: 12,
          background: "#111827",
          border: "1px solid #273244",
        }}
      >
        <strong>What to watch</strong>

        <ul style={{ marginBottom: 0 }}>
          <li>Whether monthly cashflow continues to improve or weaken.</li>
          <li>Whether rental income remains consistent.</li>
          <li>Whether loan and property expenses change materially.</li>
          <li>Whether market value changes enough to affect equity.</li>
        </ul>
      </div>

      <p
        style={{
          marginTop: 16,
          fontSize: 12,
          opacity: 0.65,
          lineHeight: 1.5,
        }}
      >
        Aequitas uses these signals to explain investment performance. A trend
        does not automatically mean you should buy, sell, refinance, or change
        strategy. Major decisions should also consider your objective,
        transaction costs, financing terms, and the quality of the underlying
        data.
      </p>
    </div>
  );
}
