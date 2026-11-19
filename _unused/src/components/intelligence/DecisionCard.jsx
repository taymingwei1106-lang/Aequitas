import AIInsightCard from "../financial/AIInsightCard";

export default function DecisionCard({
  decisions = [],
}) {
  return (
    <div className="dashboard-card">

      <h2>Decision Engine</h2>

      <div
        style={{
          display: "grid",
          gap: 18,
          marginTop: 20,
        }}
      >
        {decisions.length === 0 && (
          <AIInsightCard
            type="success"
            title="No Immediate Action"
            message="Your portfolio currently appears balanced. Continue monitoring market conditions and review periodically."
          />
        )}

        {decisions.map((decision, index) => (
          <AIInsightCard
            key={index}
            type={
              decision.priority === "high"
                ? "danger"
                : decision.priority === "medium"
                ? "warning"
                : "info"
            }
            title={decision.title}
            message={decision.description}
          />
        ))}
      </div>

    </div>
  );
}