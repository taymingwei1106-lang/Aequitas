export default function RiskAssessment({ analytics }) {

  const risk = analytics.risk;

  const Item = ({ label, value }) => (

    <div style={{ marginBottom: 18 }}>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >

        <span>{label}</span>

        <strong>{value}</strong>

      </div>

      <div
        style={{
          height: 8,
          background: "#262b35",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >

        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background:
              value >= 80
                ? "#22C55E"
                : value >= 60
                ? "#F59E0B"
                : "#EF4444",
          }}
        />

      </div>

    </div>

  );

  return (

    <div className="card">

      <h3
        style={{
          marginTop: 0,
        }}
      >

        ⚠ Risk Assessment

      </h3>

      <p
        className="page-subtitle"
      >

        Overall Risk

      </p>

      <h1
        style={{
          marginTop: 0,
          marginBottom: 4,
        }}
      >

        {risk.score}

      </h1>

      <p
        className="page-subtitle"
        style={{
          marginBottom: 24,
        }}
      >

        {risk.level} Risk

      </p>

      <Item
        label="Leverage"
        value={risk.leverage.score}
      />

      <Item
        label="Cashflow"
        value={risk.cashflow.score}
      />

      <Item
        label="Rental Yield"
        value={risk.rental.score}
      />

      <Item
        label="Equity"
        value={risk.equity.score}
      />

      <Item
        label="Liquidity"
        value={risk.liquidity.score}
      />

      <hr />

      <h4>

        Recommendations

      </h4>

      <ul>

        {risk.recommendations.map(
          (item, index) => (

            <li key={index}>

              {item}

            </li>

          )
        )}

      </ul>

    </div>

  );

}