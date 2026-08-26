import ExecutiveSummaryCard from "./ExecutiveSummaryCard";
import PortfolioScoreCard from "./PortfolioScoreCard";
import FinancialHealthCard from "./FinancialHealthCard";
import RiskAnalysisCard from "./RiskAnalysisCard";
import RecommendationCard from "./RecommendationCard";

export default function IntelligenceGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(380px, 1fr))",
        gap: 24,
        alignItems: "start",
      }}
    >
      <ExecutiveSummaryCard />

      <PortfolioScoreCard />

      <FinancialHealthCard />

      <RiskAnalysisCard />

      <RecommendationCard />
    </div>
  );
}