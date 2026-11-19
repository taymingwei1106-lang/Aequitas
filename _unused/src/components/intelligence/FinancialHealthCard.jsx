import ResultCard from "../financial/ResultCard";

export default function FinancialHealthCard() {
  const health = {
    loanToValue: "68%",
    totalDebt: "RM 1,420,000",
    equityRatio: "42%",
    debtStatus: "Healthy",
  };

  return (
    <div className="dashboard-card">

      <h2>Financial Health</h2>

      <div
        style={{
          display: "grid",
          gap: 18,
          marginTop: 20,
        }}
      >
        <ResultCard
          title="Loan to Value"
          value={health.loanToValue}
          status="positive"
          icon="🏦"
        />

        <ResultCard
          title="Outstanding Debt"
          value={health.totalDebt}
          icon="📉"
        />

        <ResultCard
          title="Equity Ratio"
          value={health.equityRatio}
          status="positive"
          icon="📈"
        />

        <ResultCard
          title="Overall Health"
          value={health.debtStatus}
          status="positive"
          icon="💚"
        />
      </div>

    </div>
  );
}