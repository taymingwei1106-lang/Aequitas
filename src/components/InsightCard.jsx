import Card from "./ui/Card";

export default function InsightCard({
  title = "Portfolio Insight",
  items = [],
}) {
  return (
    <Card className="insight-card">

      <div className="insight-header">

        <h3>{title}</h3>

      </div>

      <div className="insight-list">

        {items.map((item, index) => (

          <div
            key={index}
            className="insight-item"
          >
            <span className="insight-dot">
              💡
            </span>

            <span>{item}</span>

          </div>

        ))}

      </div>

    </Card>
  );
}