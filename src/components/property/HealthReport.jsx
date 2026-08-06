export default function HealthReport({ analytics }) {

  const health =
    analytics.health.score;

  const cashflow =
    analytics.profit.monthlyProfit;

  const growth =
    analytics.equity.market >
    analytics.investment.purchasePrice;

  const yieldHealthy =
    analytics.rentalYield.grossYield >= 4;

  const equityHealthy =
    analytics.equity.equity > 0;

  const checks = [

    {
      ok: cashflow >= 0,
      text: "Positive Monthly Cashflow",
    },

    {
      ok: growth,
      text: "Capital Appreciation",
    },

    {
      ok: yieldHealthy,
      text: "Healthy Rental Yield",
    },

    {
      ok: equityHealthy,
      text: "Positive Equity Position",
    },

  ];

  return (

    <div className="card">

      <h3
        style={{
          marginTop: 0,
        }}
      >
        ❤️ Investment Health
      </h3>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >

        <div>

          <h1
            style={{
              margin: 0,
              color: "#22C55E",
            }}
          >
            {health}/100
          </h1>

          <div
            className="page-subtitle"
          >
            Overall Health Score
          </div>

        </div>

        <div
          style={{
            fontSize: 34,
          }}
        >
          ★★★★★
        </div>

      </div>

      {

        checks.map((item) => (

          <div

            key={item.text}

            style={{

              display: "flex",

              gap: 12,

              marginBottom: 14,

            }}

          >

            <span>

              {

                item.ok

                ? "✅"

                : "⚠️"

              }

            </span>

            <span>

              {item.text}

            </span>

          </div>

        ))

      }

      <hr
        style={{
          margin: "22px 0",
          border: "none",
          borderTop: "1px solid #303544",
        }}
      />

      <p
        style={{
          marginBottom: 0,
        }}
      >

        Update the market value every
        few months to keep the health
        assessment accurate.

      </p>

    </div>

  );

}