export default function ContributionCard({ analytics }) {

  const contribution = analytics.contribution;

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

        <strong>{value}%</strong>

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
              "linear-gradient(90deg,#4f8cff,#67b8ff)",
          }}
        />

      </div>

    </div>

  );

  return (

    <div className="card">

      <h3 style={{ marginTop: 0 }}>

        📊 Portfolio Contribution

      </h3>

      <Item
        label="Portfolio Value"
        value={contribution.value}
      />

      <Item
        label="Rental Income"
        value={contribution.rental}
      />

      <Item
        label="Equity"
        value={contribution.equity}
      />

      <Item
        label="Cashflow"
        value={contribution.cashflow}
      />

    </div>

  );

}