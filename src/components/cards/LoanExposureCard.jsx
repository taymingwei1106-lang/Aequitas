import Card from "../ui/Card";

export default function LoanExposureCard({

  totalLoan = 0,

  totalValue = 0,

}) {

  const ratio =

    totalValue > 0

      ? Math.round((totalLoan / totalValue) * 100)

      : 0;

  const status =

    ratio < 50

      ? "Healthy"

      : ratio < 70

      ? "Moderate"

      : "High";

  return (

    <Card>

      <p className="metric-label">

        Loan Exposure

      </p>

      <h2 className="metric-value">

        {ratio}%

      </h2>

      <p className="section-subtitle">

        {status} Debt Risk

      </p>

      <div className="progress-track">

        <div

          className="progress-fill"

          style={{

            width:`${ratio}%`

          }}

        />

      </div>

    </Card>

  );

}