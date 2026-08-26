import formatCurrency from "../../utils/formatCurrency";

export default function ForecastCard({
  analytics,
}) {
  const forecast =
    analytics?.forecast ?? {};

  const futureMarketValue =
    forecast.futureMarketValue ?? 0;

  const capitalGrowth =
    forecast.capitalGrowth ?? 0;

  const futureEquity =
    forecast.futureEquity ?? 0;

  const futureRental =
    forecast.futureRental ?? 0;

  const years =
    forecast.years ?? 5;

  return (
    <div className="card">

      <h3
        style={{
          marginTop: 0,
        }}
      >
        📈 {years} Year Projection
      </h3>

      <p
        className="page-subtitle"
        style={{
          marginTop: 0,
          marginBottom: 20,
        }}
      >
        An illustrative projection based on
        your current property information and
        Aequitas' default assumptions.
      </p>

      <div
        style={{
          display: "grid",
          gap: 18,
        }}
      >

        <div>

          <div className="page-subtitle">
            Projected Market Value
          </div>

          <h2>
            {formatCurrency(
              futureMarketValue
            )}
          </h2>

        </div>

        <div>

          <div className="page-subtitle">
            Projected Capital Growth
          </div>

          <h2
            style={{
              color:
                capitalGrowth >= 0
                  ? "#22C55E"
                  : "#EF4444",
            }}
          >
            {formatCurrency(
              capitalGrowth
            )}
          </h2>

        </div>

        <div>

          <div className="page-subtitle">
            Projected Equity
          </div>

          <h2>
            {formatCurrency(
              futureEquity
            )}
          </h2>

        </div>

        <div>

          <div className="page-subtitle">
            Projected Monthly Rental
          </div>

          <h2>
            {formatCurrency(
              futureRental
            )}
          </h2>

        </div>

      </div>

      <details
        style={{
          marginTop: 22,
          borderTop:
            "1px solid #303544",
          paddingTop: 16,
        }}
      >

        <summary
          style={{
            cursor: "pointer",
            fontWeight: 700,
            listStyle: "none",
          }}
        >
          + How is this calculated?
        </summary>

        <div
          style={{
            marginTop: 14,
            color:
              "var(--color-text-secondary, #b7bac5)",
            lineHeight: 1.65,
          }}
        >

          <p>
            Aequitas projects the property's
            position forward using a set of
            simple assumptions. These are
            projections, not guaranteed outcomes.
          </p>

          <ul
            style={{
              paddingLeft: 20,
            }}
          >

            <li>
              <strong>
                Property growth: 4% per year
              </strong>
              {" "}
              — the current property value is
              compounded annually over the
              forecast period.
            </li>

            <li>
              <strong>
                Rental growth: 2% per year
              </strong>
              {" "}
              — current monthly rental is
              compounded annually.
            </li>

            <li>
              <strong>
                Loan reduction: 2% per year
              </strong>
              {" "}
              — the current model applies a
              simplified annual reduction to
              the outstanding loan.
            </li>

            <li>
              <strong>
                Forecast period: {years} years
              </strong>
            </li>

          </ul>

          <p
            style={{
              marginBottom: 0,
            }}
          >
            Future equity is estimated as
            projected property value minus
            projected loan balance.
          </p>

        </div>

      </details>

      <details
        style={{
          marginTop: 16,
          borderTop:
            "1px solid #303544",
          paddingTop: 16,
        }}
      >

        <summary
          style={{
            cursor: "pointer",
            fontWeight: 700,
            listStyle: "none",
          }}
        >
          + Show assumptions
        </summary>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gap: 10,
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              gap: 20,
            }}
          >
            <span>
              Property growth
            </span>

            <strong>
              4% p.a.
            </strong>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              gap: 20,
            }}
          >
            <span>
              Rental growth
            </span>

            <strong>
              2% p.a.
            </strong>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              gap: 20,
            }}
          >
            <span>
              Loan reduction
            </span>

            <strong>
              2% p.a.
            </strong>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              gap: 20,
            }}
          >
            <span>
              Forecast period
            </span>

            <strong>
              {years} years
            </strong>
          </div>

        </div>

      </details>

      <div
        style={{
          marginTop: 18,
          padding: 14,
          borderRadius: 10,
          background: "#1d2029",
          fontSize: 13,
          color:
            "var(--color-text-secondary, #b7bac5)",
          lineHeight: 1.55,
        }}
      >
        ⚠️ This is an illustrative projection.
        Actual property values, rental income
        and loan balances may differ significantly
        from these assumptions.
      </div>

    </div>
  );
}