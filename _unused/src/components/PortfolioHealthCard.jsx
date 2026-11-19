import Card from "./ui/Card";
import Badge from "./Badge";

export default function PortfolioHealthCard({

  health = 0,

  completeness = 0,

}) {

  const color =

    health >= 80

      ? "green"

      : health >= 60

      ? "orange"

      : "red";

  return (

    <Card>

      <div className="portfolio-health-header">

        <div>

          <p className="metric-label">

            Portfolio Health

          </p>

          <h1 className="portfolio-health-score">

            {health}%

          </h1>

        </div>

        <Badge color={color}>

          {completeness}% Complete

        </Badge>

      </div>

      <div className="progress-track">

        <div

          className="progress-fill"

          style={{

            width: `${health}%`,

          }}

        />

      </div>

    </Card>

  );

}