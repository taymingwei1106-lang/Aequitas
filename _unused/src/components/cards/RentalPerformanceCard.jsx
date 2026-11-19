import Card from "../ui/Card";

export default function RentalPerformanceCard({

  rental = 0,

  properties = 0,

}) {

  const average =

    properties > 0

      ? Math.round(rental / properties)

      : 0;

  return (

    <Card>

      <p className="metric-label">

        Rental Performance

      </p>

      <h2 className="metric-value">

        RM {rental.toLocaleString()}

      </h2>

      <p className="section-subtitle">

        Avg RM {average.toLocaleString()} / property

      </p>

    </Card>

  );

}