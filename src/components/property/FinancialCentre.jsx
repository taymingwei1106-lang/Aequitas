import formatCurrency from "../../utils/formatCurrency";

export default function FinancialCentre({ analytics }) {

  const purchase =
    analytics.investment.purchasePrice;

  const market =
    analytics.equity.market;

  const loan =
    analytics.equity.loan;

  const equity =
    analytics.equity.equity;

  const rental =
    analytics.cashflow.rental;

  const commitments =
    analytics.commitments.totalCommitments;

  const cashflow =
    analytics.profit.monthlyProfit;

  const yieldValue =
    analytics.rentalYield.grossYield;

  const capitalGrowth =
    market - purchase;

  return (

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(320px,1fr))",
        gap: 24,
      }}
    >

      <div className="card">

        <h3
          style={{
            marginTop: 0,
          }}
        >
          💰 Financial Position
        </h3>

        <FinancialRow
          label="Purchase Price"
          value={purchase}
        />

        <FinancialRow
          label="Current Market Value"
          value={market}
        />

        <FinancialRow
          label="Outstanding Loan"
          value={loan}
        />

        <FinancialRow
          label="Current Equity"
          value={equity}
          positive
        />

        <FinancialRow
          label="Capital Growth"
          value={capitalGrowth}
          positive={capitalGrowth >= 0}
        />

      </div>

      <div className="card">

        <h3
          style={{
            marginTop: 0,
          }}
        >
          📈 Monthly Performance
        </h3>

        <FinancialRow
          label="Monthly Rental"
          value={rental}
        />

        <FinancialRow
          label="Monthly Commitment"
          value={commitments}
        />

        <FinancialRow
          label="Net Cashflow"
          value={cashflow}
          positive={cashflow >= 0}
        />

        <div
          style={{
            marginTop: 20,
            paddingTop: 18,
            borderTop: "1px solid #303544",
          }}
        >

          <div className="card-label">

            Rental Yield

          </div>

          <h2
            style={{
              marginBottom: 0,
            }}
          >

            {yieldValue.toFixed(2)}%

          </h2>

        </div>

      </div>

    </div>

  );

}

function FinancialRow({

  label,

  value,

  positive,

}) {

  return (

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 18,
      }}
    >

      <span>

        {label}

      </span>

      <strong
        style={{
          color:

            positive === undefined

              ? "inherit"

              : positive

              ? "#22C55E"

              : "#EF4444",

        }}
      >

        RM {formatCurrency(value)}

      </strong>

    </div>

  );

}