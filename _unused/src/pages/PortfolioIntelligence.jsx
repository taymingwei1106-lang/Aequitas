import IntelligenceGrid from "../components/intelligence/IntelligenceGrid";

export default function PortfolioIntelligence() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Portfolio Intelligence</h1>

        <p className="page-description">
          A comprehensive analysis of your property
          portfolio's performance, financial health,
          diversification and future growth potential.
        </p>
      </div>

      <IntelligenceGrid />
    </div>
  );
}