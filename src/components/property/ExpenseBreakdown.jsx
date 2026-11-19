import formatCurrency from "../../utils/formatCurrency";

export default function ExpenseBreakdown({ property }) {

  const items = [

    {
      label: "Loan Instalment",
      value: Number(property.monthlyInstalment || 0),
    },

    {
      label: "Maintenance",
      value: Number(property.maintenanceFee || 0),
    },

    {
      label: "Insurance",
      value: Number(property.insurance || 0),
    },

    {
      label: "Assessment Tax",
      value: Number(property.assessmentTax || 0),
    },

    {
      label: "Quit Rent",
      value: Number(property.quitRent || 0),
    },

    {
      label: "Management Fee",
      value: Number(property.managementFee || 0),
    },

    {
      label: "Other Expenses",
      value: Number(property.otherExpenses || 0),
    },

  ];

  const total =
    items.reduce(
      (sum, item) => sum + item.value,
      0
    );

  return (

    <div className="card">

      <h3
        style={{
          marginTop: 0,
        }}
      >
        💳 Monthly Expense Breakdown
      </h3>

      {

        items.map((item) => (

          <Row

            key={item.label}

            label={item.label}

            value={item.value}

          />

        ))

      }

      <hr
        style={{
          margin: "20px 0",
          border: "none",
          borderTop: "1px solid var(--color-border-strong)",
        }}
      />

      <Row

        label="TOTAL"

        value={total}

        bold

      />

    </div>

  );

}

function Row({

  label,

  value,

  bold,

}) {

  return (

    <div

      style={{

        display: "flex",

        justifyContent: "space-between",

        marginBottom: 14,

      }}

    >

      <span

        style={{

          fontWeight:

            bold ? 700 : 400,

        }}

      >

        {label}

      </span>

      <strong>

        RM {formatCurrency(value)}

      </strong>

    </div>

  );

}