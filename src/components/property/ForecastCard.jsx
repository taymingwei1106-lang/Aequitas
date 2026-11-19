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

  const assumptions = forecast.assumptions ?? {
    annualGrowthRate: 4,
    annualRentalGrowth: 2,
    loanMethod: "simplified",
  };

  const amortised = assumptions.loanMethod === "amortised";

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
        the growth assumptions set in Settings.
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
                  ? "var(--color-success)"
                  : "var(--color-danger)",
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
            "1px solid var(--color-border-strong)",
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
              "var(--color-text-secondary, var(--color-text-secondary))",
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
                Property growth: {assumptions.annualGrowthRate}% per year
              </strong>
              {" "}
              — the current property value is
              compounded annually over the
              forecast period.
            </li>

            <li>
              <strong>
                Rental growth: {assumptions.annualRentalGrowth}% per year
              </strong>
              {" "}
              — current monthly rental is
              compounded annually.
            </li>

            <li>
              <strong>
                {amortised
                  ? `Loan: repaid at ${assumptions.interestRate}% interest`
                  : "Loan reduction: 2% per year"}
              </strong>
              {" "}
              {amortised
                ? "— the balance is projected month by month using your recorded interest rate and instalment."
                : "— a simplified reduction, because no interest rate is recorded. Add one in Edit Property for a real projection."}
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
            "1px solid var(--color-border-strong)",
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
              {assumptions.annualGrowthRate}% p.a.
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
              {assumptions.annualRentalGrowth}% p.a.
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
              Loan
            </span>

            <strong>
              {amortised
                ? `Amortised at ${assumptions.interestRate}%`
                : "Simplified 2% p.a."}
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
          background: "var(--color-surface-elevated)",
          fontSize: 13,
          color:
            "var(--color-text-secondary, var(--color-text-secondary))",
          lineHeight: 1.55,
        }}
      >
        ⚠️ This is an illustrative projection.
        Actual property values, rental income
        and loan balances may differ significantly
        from these assumptions. Growth rates can be
        changed in Settings.
      </div>

    </div>
  );
}