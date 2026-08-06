import formatCurrency from "../../utils/formatCurrency";

export default function ForecastCard({ analytics }) {

  const forecast = analytics.forecast;

  return (

    <div className="card">

      <h3
        style={{
          marginTop: 0,
        }}
      >
        📈 5 Year Forecast
      </h3>

      <div
        style={{
          display: "grid",
          gap: 18,
        }}
      >

        <div>

          <div className="page-subtitle">

            Future Market Value

          </div>

          <h2>

            {formatCurrency(forecast.futureMarketValue)}

          </h2>

        </div>

        <div>

          <div className="page-subtitle">

            Capital Growth

          </div>

          <h2
            style={{
              color: "#22C55E",
            }}
          >

            {formatCurrency(forecast.capitalGrowth)}

          </h2>

        </div>

        <div>

          <div className="page-subtitle">

            Projected Equity

          </div>

          <h2>

            {formatCurrency(forecast.futureEquity)}

          </h2>

        </div>

        <div>

          <div className="page-subtitle">

            Projected Monthly Rental

          </div>

          <h2>

            {formatCurrency(forecast.futureRental)}

          </h2>

        </div>

      </div>

    </div>

  );

}