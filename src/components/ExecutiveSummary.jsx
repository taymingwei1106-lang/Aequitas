import formatCurrency from "../utils/formatCurrency";

export default function ExecutiveSummary({ property, analytics }) {
  const cashflow = Number(
    analytics?.profit?.monthlyProfit ??
      0
  );

  const purchase = Number(
    analytics?.investment?.purchasePrice ??
      property?.purchasePrice ??
      0
  );

  const market = Number(
    analytics?.equity?.market ??
      property?.marketValue ??
      purchase
  );

  const capitalGrowth = market - purchase;

  const roi = Number(
    analytics?.investment?.roi ??
      0
  );

  const yieldValue = Number(
    analytics?.rentalYield?.grossYield ??
      0
  );

  const health = Number(
    analytics?.health?.score ??
      analytics?.investmentHealth?.score ??
      0
  );

  function getHealthLabel() {
    if (health >= 80) return { text: "Strong Position", icon: "🟢" };
    if (health >= 60) return { text: "Stable Position", icon: "🟡" };
    if (health >= 40) return { text: "Needs Attention", icon: "🟠" };
    return { text: "Higher Risk Position", icon: "🔴" };
  }

  const healthStatus = getHealthLabel();

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
          <p className="page-subtitle">PROPERTY COMMAND CENTRE</p>

          <h1 style={{ margin: "6px 0" }}>
            🏢 {property.projectName || "Investment Property"}
          </h1>

          <h3 style={{ marginTop: 4 }}>
            {healthStatus.icon} {healthStatus.text}
          </h3>
        </div>

        <div style={{ textAlign: "right" }}>
          <div className="card-label">Investment Health</div>

          <h1
            style={{
              margin: 0,
              color:
                health >= 80
                  ? "#22C55E"
                  : health >= 60
                  ? "#FACC15"
                  : health >= 40
                  ? "#F97316"
                  : "#EF4444",
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
          <div className="card-label">Monthly Cashflow</div>
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
          <div className="card-label">Capital Growth</div>
          <h2>RM {formatCurrency(capitalGrowth)}</h2>
        </div>

        <div>
          <div className="card-label">Rental Yield</div>
          <h2>{yieldValue.toFixed(2)}%</h2>
        </div>

        <div>
          <div className="card-label">ROI</div>
          <h2>{roi.toFixed(2)}%</h2>
        </div>
      </div>

      <div
        style={{
          marginTop: 20,
          padding: 14,
          borderRadius: 10,
          background: "#111827",
          border: "1px solid #273244",
        }}
      >
        <span className="page-subtitle">
          Start with the overview. Use the tabs below when you want to
          investigate something in more detail.
        </span>
      </div>
    </div>
  );
}
