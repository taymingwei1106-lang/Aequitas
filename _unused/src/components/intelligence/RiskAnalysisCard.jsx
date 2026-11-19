import AIInsightCard from "../financial/AIInsightCard";
import ResultCard from "../financial/ResultCard";

export default function RiskAnalysisCard() {
  // Placeholder values.
  // Will later come from intelligenceEngine.js

  const risk = {
    overall: "Medium",
    diversification: "Good",
    leverage: "Healthy",
    cashflow: "Positive",
  };

  return (
    <div className="dashboard-card">

      <h2>Risk Analysis</h2>

      <div
        style={{
          display: "grid",
          gap: 18,
          marginTop: 20,
        }}
      >

        <ResultCard
          title="Overall Risk"
          value={risk.overall}
          status="warning"
          icon="⚠️"
        />

        <ResultCard
          title="Diversification"
          value={risk.diversification}
          status="positive"
          icon="🌏"
        />

        <ResultCard
          title="Leverage"
          value={risk.leverage}
          status="positive"
          icon="🏦"
        />

        <ResultCard
          title="Cashflow"
          value={risk.cashflow}
          status="positive"
          icon="💰"
        />

      </div>

      <div
        style={{
          marginTop: 24,
        }}
      >
        <AIInsightCard
          type="warning"
          title="Risk Assessment"
          message="Your portfolio is financially healthy, but remains moderately concentrated. Increasing geographic or property-type diversification could reduce long-term investment risk."
        />
      </div>

    </div>
  );
}