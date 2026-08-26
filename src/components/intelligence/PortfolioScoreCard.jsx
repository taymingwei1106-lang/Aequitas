import AIInsightCard from "../financial/AIInsightCard";

export default function PortfolioScoreCard() {
  // Placeholder data.
  // Will later come from intelligenceEngine.js

  const score = 84;

  function getRating(score) {
    if (score >= 90)
      return {
        stars: "★★★★★",
        level: "Outstanding",
        type: "success",
      };

    if (score >= 80)
      return {
        stars: "★★★★☆",
        level: "Excellent",
        type: "success",
      };

    if (score >= 70)
      return {
        stars: "★★★☆☆",
        level: "Good",
        type: "warning",
      };

    if (score >= 60)
      return {
        stars: "★★☆☆☆",
        level: "Fair",
        type: "warning",
      };

    return {
      stars: "★☆☆☆☆",
      level: "Needs Attention",
      type: "danger",
    };
  }

  const rating = getRating(score);

  return (
    <div className="dashboard-card">
      <h2>Portfolio Score</h2>

      <div
        style={{
          textAlign: "center",
          margin: "30px 0",
        }}
      >
        <div
          style={{
            fontSize: "3rem",
            fontWeight: 700,
          }}
        >
          {score}
        </div>

        <div
          style={{
            fontSize: "1.1rem",
            opacity: 0.75,
          }}
        >
          /100
        </div>

        <div
          style={{
            marginTop: 18,
            fontSize: "2rem",
          }}
        >
          {rating.stars}
        </div>

        <h3
          style={{
            marginTop: 16,
          }}
        >
          {rating.level}
        </h3>
      </div>

      <AIInsightCard
        type={rating.type}
        title="Portfolio Assessment"
        message={`Your portfolio currently scores ${score}/100. Continue improving diversification, cashflow and equity growth to increase your investment resilience.`}
      />
    </div>
  );
}