import Card from "../ui/Card";

export default function NetEquityCard({

  totalValue = 0,

  totalLoan = 0,

}) {

  const equity = totalValue - totalLoan;

  const percentage =

    totalValue > 0

      ? Math.round((equity / totalValue) * 100)

      : 0;

  return (

    <Card>

      <p className="metric-label">

        Net Equity

      </p>

      <h2 className="metric-value">

        RM {equity.toLocaleString()}

      </h2>

      <p className="section-subtitle">

        {percentage}% of portfolio owned

      </p>

      <div className="progress-track">

        <div

          className="progress-fill"

          style={{

            width:`${percentage}%`

          }}

        />

      </div>

    </Card>

  );

}