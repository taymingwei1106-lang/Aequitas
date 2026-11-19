import Card from "./ui/Card";

export default function ProgressCard({
  title,
  value,
  subtitle,
}) {
  return (
    <Card className="progress-card">

      <div className="progress-header">

        <div>

          <h3>{title}</h3>

          {subtitle && (
            <p>{subtitle}</p>
          )}

        </div>

        <h2>{value}%</h2>

      </div>

      <div className="progress-track">

        <div
          className="progress-fill"
          style={{
            width: `${value}%`,
          }}
        />

      </div>

    </Card>
  );
}