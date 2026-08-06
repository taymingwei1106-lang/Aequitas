import Card from "./ui/Card";

export default function MetricCard({
  label,
  value,
  change,
  positive = true,
}) {
  return (
    <Card className="metric-card">

      <span className="metric-label">
        {label}
      </span>

      <h2 className="metric-value">
        {value}
      </h2>

      {change && (
        <div
          className={
            positive
              ? "metric-positive"
              : "metric-negative"
          }
        >
          {change}
        </div>
      )}

    </Card>
  );
}