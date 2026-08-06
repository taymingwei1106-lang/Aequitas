import Card from "../ui/Card";

export default function PortfolioCompletionCard({

  completion = 0,

}) {

  return (

    <Card>

      <p className="metric-label">

        Portfolio Completion

      </p>

      <h2 className="metric-value">

        {completion}%

      </h2>

      <div className="progress-track">

        <div

          className="progress-fill"

          style={{

            width:`${completion}%`

          }}

        />

      </div>

      <p className="section-subtitle">

        Complete more data to unlock analytics.

      </p>

    </Card>

  );

}