import formatCurrency from "../../utils/formatCurrency";

export default function FinancialCentre({ analytics }) {
  const purchase = Number(
    analytics?.investment?.purchasePrice || 0
  );

  const market = Number(
    analytics?.equity?.market || 0
  );

  const loan = Number(
    analytics?.equity?.loan || 0
  );

  const equity = Number(
    analytics?.equity?.equity || 0
  );

  const rental = Number(
    analytics?.cashflow?.rental || 0
  );

  const commitments = Number(
    analytics?.commitments?.totalCommitments || 0
  );

  const cashflow = Number(
    analytics?.profit?.monthlyProfit || 0
  );

  const yieldValue = Number(
    analytics?.rentalYield?.grossYield || 0
  );

  const capitalGrowth = market - purchase;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(320px,1fr))",
        gap: 20,
      }}
    >
      <div className="card">
        <h3 style={{ marginTop: 0 }}>💰 Financial Position</h3>

        <FinancialRow label="Purchase Price" value={purchase} />
        <FinancialRow label="Current Market Value" value={market} />
        <FinancialRow label="Outstanding Loan" value={loan} />
        <FinancialRow label="Current Equity" value={equity} positive />
        <FinancialRow
          label="Capital Growth"
          value={capitalGrowth}
          positive={capitalGrowth >= 0}
        />
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>📈 Monthly Position</h3>

        <FinancialRow label="Rental Income" value={rental} />
        <FinancialRow label="Monthly Commitments" value={commitments} />
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
          <div className="card-label">Rental Yield</div>
          <h2 style={{ marginBottom: 0 }}>
            {yieldValue.toFixed(2)}%
          </h2>
        </div>
      </div>
    </div>
  );
}

function FinancialRow({ label, value, positive }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 16,
      }}
    >
      <span>{label}</span>

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
