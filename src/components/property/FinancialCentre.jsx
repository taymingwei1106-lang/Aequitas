import {
  amount,
  formatRM,
  getCurrentValue,
  getMonthlyCashflow,
} from "../../utils/propertyFinancials";

/*
 * Financial Position and Monthly Position.
 *
 * Reads the property directly through the shared financial module, so the
 * figures match every other screen. When no market valuation is recorded,
 * value-based figures say so instead of showing purchase price as value
 * and RM 0 as growth.
 */
export default function FinancialCentre({ property }) {
  const purchase = amount(property?.purchasePrice);
  const value = getCurrentValue(property);
  const hasValuation = value.source === "market";
  const loan = amount(property?.outstandingLoan);
  const equity = value.value - loan;
  const flow = getMonthlyCashflow(property);
  const grossYield = purchase > 0 ? ((flow.rental * 12) / purchase) * 100 : 0;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
        gap: 20,
      }}
    >
      <div className="card">
        <h3 style={{ marginTop: 0 }}>💰 Financial Position</h3>

        <Row label="Purchase Price" value={formatRM(purchase)} />
        <Row
          label="Current Market Value"
          value={hasValuation ? formatRM(value.value) : "Not recorded"}
          muted={!hasValuation}
        />
        <Row label="Outstanding Loan" value={formatRM(loan, 2)} />
        <Row
          label={hasValuation ? "Equity" : "Equity (vs purchase price)"}
          value={formatRM(equity)}
          tone={equity >= 0 ? "positive" : "negative"}
        />
        <Row
          label="Capital Growth"
          value={
            hasValuation ? formatRM(value.value - purchase) : "Not measured"
          }
          tone={
            hasValuation
              ? value.value - purchase >= 0
                ? "positive"
                : "negative"
              : undefined
          }
          muted={!hasValuation}
        />

        {!hasValuation && (
          <p className="page-subtitle" style={{ fontSize: 12, margin: 0 }}>
            Add a market value (Edit Property, or in your latest monthly
            check-in) to measure growth and true equity.
          </p>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>📈 Monthly Position</h3>

        <Row label="Rental Income" value={formatRM(flow.rental)} />
        {flow.otherIncome > 0 && (
          <Row label="Other Income" value={formatRM(flow.otherIncome)} />
        )}
        <Row label="Loan Instalment" value={formatRM(-flow.instalment)} />
        <Row label="Recurring Expenses" value={formatRM(-flow.expenses, 2)} />
        <Row
          label="Net Cashflow"
          value={formatRM(flow.cashflow, 2)}
          tone={flow.cashflow >= 0 ? "positive" : "negative"}
          strong
        />

        <div
          style={{
            marginTop: 20,
            paddingTop: 18,
            borderTop: "1px solid var(--color-border-strong)",
          }}
        >
          <div className="card-label">Gross Rental Yield</div>
          <h2 style={{ margin: "6px 0 4px" }}>{grossYield.toFixed(2)}%</h2>
          <div className="page-subtitle" style={{ fontSize: 12 }}>
            Annual rent ÷ purchase price
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, tone, muted, strong }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 16,
        paddingTop: strong ? 12 : 0,
        borderTop: strong ? "1px solid var(--color-border-strong)" : "none",
      }}
    >
      <span>{label}</span>
      <strong
        style={{
          color:
            tone === "positive"
              ? "var(--color-success)"
              : tone === "negative"
              ? "var(--color-danger)"
              : muted
              ? "var(--color-text-secondary)"
              : "inherit",
          fontWeight: muted ? 500 : 700,
        }}
      >
        {value}
      </strong>
    </div>
  );
}
