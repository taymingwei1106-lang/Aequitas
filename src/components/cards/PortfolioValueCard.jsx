import Card from "../ui/Card";

export default function PortfolioValueCard({

  totalValue = 0,

  properties = 0,

}) {

  const average =

    properties

      ? Math.round(totalValue / properties)

      : 0;

  return (

    <Card>

      <p className="metric-label">

        Portfolio Value

      </p>

      <h2 className="metric-value">

        RM {totalValue.toLocaleString()}

      </h2>

      <p className="section-subtitle">

        Avg RM {average.toLocaleString()} / investment

      </p>

    </Card>

  );

}