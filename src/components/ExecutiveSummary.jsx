import formatCurrency from "../utils/formatCurrency";
export default function ExecutiveSummary({
  property,
  analytics,
}) {
  const cashflow = analytics.profit.monthlyProfit;

  const purchase = analytics.investment.purchasePrice;

  const market = analytics.equity.market;

  const capitalGrowth = market - purchase;

  const roi = analytics.investment.roi || 0;

  const yieldValue =
    analytics.rentalYield.grossYield || 0;

  const health = analytics.health.score;

  function recommendation() {
    if (cashflow > 0 && health >= 80)
      return "Continue holding.";

    if (cashflow < 0)
      return "Review monthly expenses.";

    return "Monitor investment performance.";
  }

  return (
    <div className="card">

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 24,
        }}
      >
        <div>

          <p className="page-subtitle">
            Property Command Centre
          </p>

          <h1
            style={{
              margin: "6px 0",
            }}
          >
            🏢 {property.projectName}
          </h1>

          <h3
            style={{
              color: "#22C55E",
              marginTop: 4,
            }}
          >
            ★★★★★ Healthy Investment
          </h3>

        </div>

        <div
          style={{
            textAlign: "right",
          }}
        >
          <div className="card-label">
            Investment Health
          </div>

          <h1
            style={{
              margin: 0,
              color: "var(--color-primary)",
            }}
          >
            {health}/100
          </h1>

        </div>

      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",
          gap: 20,
          marginTop: 30,
        }}
      >

        <div>

          <div className="card-label">
            Monthly Cashflow
          </div>

          <h2
            style={{
              color:
                cashflow >= 0
                  ? "#22C55E"
                  : "#EF4444",
            }}
          >
            RM {formatCurrency(cashflow)}
          </h2>

        </div>

        <div>

          <div className="card-label">
            Capital Growth
          </div>

          <h2>
            RM {formatCurrency(capitalGrowth)}
          </h2>

        </div>

        <div>

          <div className="card-label">
            Rental Yield
          </div>

          <h2>
            {yieldValue.toFixed(2)}%
          </h2>

        </div>

        <div>

          <div className="card-label">
            ROI
          </div>

          <h2>
            {roi.toFixed(2)}%
          </h2>

        </div>

      </div>

      <div
        style={{
          marginTop: 24,
          padding: 18,
          borderRadius: 12,
          background: "#1d2533",
        }}
      >

        <strong>
          🧠 Recommendation
        </strong>

        <p
          style={{
            marginTop: 10,
            marginBottom: 0,
          }}
        >
          {recommendation()}
        </p>

      </div>

    </div>
  );
}