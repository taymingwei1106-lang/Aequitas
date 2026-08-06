import formatCurrency from "../../utils/formatCurrency";

export default function InvestmentBreakdown({ property }) {

  const purchase =
    Number(property.purchasePrice || 0);

  const renovation =
    Number(property.renovationCost || 0);

  const legal =
    Number(property.legalFees || 0);

  const stampDuty =
    Number(property.stampDuty || 0);

  const furnishing =
    Number(property.furnishingCost || 0);

  const totalInvestment =
    purchase +
    renovation +
    legal +
    stampDuty +
    furnishing;

  return (

    <div className="card">

      <h3
        style={{
          marginTop: 0,
        }}
      >
        🏗 Investment Breakdown
      </h3>

      <Row
        label="Purchase Price"
        value={purchase}
      />

      <Row
        label="Renovation"
        value={renovation}
      />

      <Row
        label="Legal Fees"
        value={legal}
      />

      <Row
        label="Stamp Duty"
        value={stampDuty}
      />

      <Row
        label="Furnishing"
        value={furnishing}
      />

      <hr
        style={{
          margin: "20px 0",
          border: "none",
          borderTop: "1px solid #303544",
        }}
      />

      <Row
        label="Total Capital Invested"
        value={totalInvestment}
        highlight
      />

    </div>

  );

}

function Row({

  label,

  value,

  highlight,

}) {

  return (

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 16,
      }}
    >

      <span
        style={{
          fontWeight:
            highlight ? 700 : 500,
        }}
      >

        {label}

      </span>

      <strong
        style={{
          color:
            highlight
              ? "#22C55E"
              : "inherit",
        }}
      >

        RM {formatCurrency(value)}

      </strong>

    </div>

  );

}