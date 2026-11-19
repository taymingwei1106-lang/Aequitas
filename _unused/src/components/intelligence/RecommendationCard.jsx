import AIInsightCard from "../financial/AIInsightCard";

export default function RecommendationCard() {

  const recommendations = [
    "Increase exposure to landed residential properties.",
    "Consider refinancing high-interest loans.",
    "Monitor rental yield for underperforming assets.",
    "Maintain current cashflow surplus for future acquisitions.",
  ];

  return (
    <div className="dashboard-card">

      <h2>AI Recommendations</h2>

      <div
        style={{
          display: "grid",
          gap: 18,
          marginTop: 20,
        }}
      >

        {recommendations.map((item, index) => (
          <AIInsightCard
            key={index}
            type="info"
            title={`Recommendation ${index + 1}`}
            message={item}
          />
        ))}

      </div>

    </div>
  );
}