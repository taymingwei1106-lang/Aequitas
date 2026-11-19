import ResultCard from "../financial/ResultCard";
import { usePortfolio } from "../../context/PortfolioContext";
import { generateExecutiveSummary } from "../../services/intelligenceEngine";

export default function ExecutiveSummaryCard() {

    const { portfolio } = usePortfolio();

    const summary =
        generateExecutiveSummary(portfolio);

  return (
    <div className="dashboard-card">

      <h2
        style={{
          marginBottom: 20,
        }}
      >
        Executive Summary
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2,1fr)",
          gap: 18,
        }}
      >

        <ResultCard
          title="Properties"
          value={summary.properties}
          icon="🏠"
        />

        <ResultCard
          title="Portfolio Value"
          value={`RM ${summary.portfolioValue.toLocaleString()}`}
          icon="💼"
        />

        <ResultCard
          title="Total Equity"
          value={`RM ${summary.totalEquity.toLocaleString()}`}
          status="positive"
          icon="📈"
        />

        <ResultCard
          title="Monthly Cashflow"
          value={`RM ${summary.monthlyCashflow.toLocaleString()}`}
          status="positive"
          icon="💰"
        />

      </div>

    </div>
  );
}