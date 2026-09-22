import { calculatePerformanceIntelligence } from "../../utils/PerformanceIntelligenceEngine";

function formatRM(value) {
  const number = Number(value) || 0;
  return `RM ${number.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
}

function formatMovement(value) {
  const number = Number(value) || 0;
  const prefix = number > 0 ? "+" : "";
  return `${prefix}${formatRM(number)}`;
}

function getTrendLabel(trend) {
  if (trend === "improving") return "Improving";
  if (trend === "weakening") return "Weakening";
  if (trend === "stable") return "Stable";
  return "Not enough history";
}

export default function AIAdvisor({ analytics, property }) {
  const cashflow = Number(analytics?.profit?.monthlyProfit) || 0;
  const yieldValue = Number(analytics?.rentalYield?.grossYield) || 0;
  const equity = Number(analytics?.equity?.equity) || 0;

  const purchasePrice =
    Number(analytics?.investment?.purchasePrice) || 0;
  const marketValue = Number(analytics?.equity?.market) || 0;
  const growth = marketValue - purchasePrice;

  const performance = property
    ? calculatePerformanceIntelligence(property.id)
    : null;

  const hasThreeMonths = Boolean(
    performance?.hasEnoughHistory ||
      performance?.monthsAnalysed >= 3 ||
      performance?.monthsAnalyzed >= 3
  );

  let recommendation =
    "Continue monitoring this investment.";

  if (hasThreeMonths) {
    if (performance.overallTrend === "weakening") {
      recommendation =
        "Review the recent performance before making a major change.";
    } else if (performance.overallTrend === "improving") {
      recommendation =
        "Continue monitoring. Recent performance is improving.";
    } else if (performance.overallTrend === "stable") {
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

  const movements = performance?.movements || performance?.changes || {};

  const cashflowMovement =
    movements.cashflow ??
    movements.monthlyCashflow ??
    performance?.cashflowMovement ??
    0;

  const rentalMovement =
    movements.rental ??
    movements.rentalIncome ??
    movements.monthlyRental ??
    performance?.rentalMovement ??
    0;

  const loanMovement =
    movements.loanBalance ??
    movements.outstandingLoan ??
    movements.loan ??
    performance?.loanBalanceMovement ??
    0;

  const maintenanceMovement =
    movements.maintenanceAndExpenses ??
    movements.maintenanceExpenses ??
    movements.expenses ??
    movements.maintenance ??
    performance?.expenseMovement ??
    0;

  const marketValueMovement =
    movements.marketValue ??
    movements.value ??
    performance?.marketValueMovement ??
    0;

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>🧠 Aequitas Advisor</h3>

      <p>
        Overall, this investment is
        {cashflow >= 0
          ? " generating positive monthly cashflow."
          : " currently operating at a monthly loss."}
      </p>

      <p>
        Rental yield currently stands at{" "}
        <strong>{yieldValue.toFixed(2)}%</strong>.
      </p>

      <p>
        Current equity has reached <strong>{formatRM(equity)}</strong>.
      </p>

      <p>
        Capital appreciation totals <strong>{formatRM(growth)}</strong>.
      </p>

      <div
        style={{
          marginTop: 24,
          padding: 18,
          borderRadius: 12,
          background: "#1D2533",
        }}
      >
        <strong>Recommendation</strong>

        <p
          style={{
            marginBottom: 0,
            marginTop: 10,
          }}
        >
          {recommendation}
        </p>
      </div>

      {hasThreeMonths && (
        <details style={{ marginTop: 20 }}>
          <summary
            style={{
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Why is Aequitas saying this?
          </summary>

          <div style={{ marginTop: 16 }}>
            <p style={{ marginTop: 0 }}>
              Aequitas is looking at the recent monthly history rather than
              relying only on today's snapshot.
            </p>

            <p>
              <strong>Recent trend:</strong>{" "}
              {getTrendLabel(performance?.overallTrend)}
            </p>

            {performance?.summary && (
              <p>
                <strong>Summary:</strong> {performance.summary}
              </p>
            )}

            <div
              style={{
                display: "grid",
                gap: 10,
                marginTop: 16,
              }}
            >
              <div>
                <strong>Cashflow movement:</strong>{" "}
                {formatMovement(cashflowMovement)}
              </div>

              <div>
                <strong>Rental movement:</strong>{" "}
                {formatMovement(rentalMovement)}
              </div>

              <div>
                <strong>Loan balance movement:</strong>{" "}
                {formatMovement(loanMovement)}
              </div>

              <div>
                <strong>Maintenance & expenses movement:</strong>{" "}
                {formatMovement(maintenanceMovement)}
              </div>

              <div>
                <strong>Market value movement:</strong>{" "}
                {formatMovement(marketValueMovement)}
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                padding: 14,
                borderRadius: 10,
                background: "#151B26",
              }}
            >
              <strong>What to watch</strong>
              <p style={{ marginBottom: 0, marginTop: 8 }}>
                Watch whether the recent direction continues. A short-term
                movement does not automatically mean the property should be
                sold, refinanced, or otherwise changed. Major decisions should
                also consider your investment objective, financing terms,
                transaction costs, and the quality of the underlying data.
              </p>
            </div>
          </div>
        </details>
      )}

      {!hasThreeMonths && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 10,
            background: "#151B26",
          }}
        >
          <strong>Performance history</strong>
          <p style={{ marginBottom: 0, marginTop: 8 }}>
            Aequitas will become more informative as more monthly check-ins are
            recorded. Major strategy changes are better assessed using a
            consistent history rather than a single month's result.
          </p>
        </div>
      )}
    </div>
  );
}
