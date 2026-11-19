import Card from "../ui/Card";
import Badge from "../Badge";

export default function PropertyHealthCard({

  score,

}) {

  const color =

    score >= 80

      ? "green"

      : score >= 60

      ? "orange"

      : "red";

  return (

    <Card>

      <div className="property-health">

        <div>

          <p className="metric-label">

            Investment Health

          </p>

          <h2>

            {score}%

          </h2>

        </div>

        <Badge color={color}>

          Healthy

        </Badge>

      </div>

    </Card>

  );

}