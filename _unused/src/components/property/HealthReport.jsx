export default function HealthReport({
  analytics,
}) {

  const health =
    analytics?.investmentHealth ??
    analytics?.health;

  const data =
    analytics?.dataCompleteness;

  const components =
    health?.components ?? {};

  const healthScore =
    health?.score ?? 0;

  const healthLevel =
    health?.level ??
    "Needs Attention";

  const dataScore =
    data?.score ?? 0;

  const dataCompleted =
    data?.completed ?? 0;

  const dataTotal =
    data?.total ?? 0;

  function getHealthIcon() {
    if (healthScore >= 80) {
      return "🟢";
    }

    if (healthScore >= 65) {
      return "🟡";
    }

    if (healthScore >= 50) {
      return "🟠";
    }

    return "🔴";
  }

  function getComponentLabel(score) {
    if (score >= 80) {
      return "Strong";
    }

    if (score >= 65) {
      return "Healthy";
    }

    if (score >= 50) {
      return "Moderate";
    }

    return "Needs Attention";
  }

  const checks = [
    {
      score:
        components.cashflow ?? 0,
      label:
        "Monthly Cashflow",
      weight: "25%",
    },

    {
      score:
        components.leverage ?? 0,
      label:
        "Leverage",
      weight: "25%",
    },

    {
      score:
        components.rentalYield ?? 0,
      label:
        "Rental Yield",
      weight: "20%",
    },

    {
      score:
        components.equity ?? 0,
      label:
        "Equity Position",
      weight: "20%",
    },

    {
      score:
        components.capitalGrowth ?? 0,
      label:
        "Capital Growth",
      weight: "10%",
    },
  ];

  return (
    <div className="card">

      <h3
        style={{
          marginTop: 0,
        }}
      >
        ❤️ Investment Health
      </h3>

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: 20,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >

        <div>

          <h1
            style={{
              margin: 0,
            }}
          >
            {getHealthIcon()}{" "}
            {healthScore}/100
          </h1>

          <div
            className="page-subtitle"
            style={{
              marginTop: 6,
            }}
          >
            {healthLevel} Investment
          </div>

        </div>

        <div
          style={{
            textAlign: "right",
            fontSize: 13,
            opacity: 0.7,
          }}
        >
          Financial performance
          <br />
          and position
        </div>

      </div>

      <div
        style={{
          display: "grid",
          gap: 12,
        }}
      >

        {checks.map(
          (item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                gap: 16,
                padding: 12,
                borderRadius: 10,
                background:
                  "#171a22",
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >

                <span>
                  {item.score >= 65
                    ? "✅"
                    : item.score >= 50
                    ? "⚠️"
                    : "🔴"}
                </span>

                <span>
                  {item.label}
                </span>

              </div>

              <div
                style={{
                  textAlign: "right",
                }}
              >

                <strong>
                  {getComponentLabel(
                    item.score
                  )}
                </strong>

                <div
                  style={{
                    fontSize: 11,
                    opacity: 0.55,
                  }}
                >
                  {item.weight}
                </div>

              </div>

            </div>
          )
        )}

      </div>

      <details
        style={{
          marginTop: 20,
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
          + Why this score?
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
            Aequitas evaluates five areas
            of the investment:
          </p>

          <ul
            style={{
              paddingLeft: 20,
            }}
          >

            <li>
              <strong>
                Cashflow — 25%
              </strong>
              {" "}
              measures whether the property
              is producing positive or negative
              monthly cashflow.
            </li>

            <li>
              <strong>
                Leverage — 25%
              </strong>
              {" "}
              measures debt relative to
              property value.
            </li>

            <li>
              <strong>
                Rental Yield — 20%
              </strong>
              {" "}
              measures rental income relative
              to property value.
            </li>

            <li>
              <strong>
                Equity — 20%
              </strong>
              {" "}
              measures how much of the
              property's value is currently
              owned after debt.
            </li>

            <li>
              <strong>
                Capital Growth — 10%
              </strong>
              {" "}
              compares current property value
              against purchase price.
            </li>

          </ul>

          <p
            style={{
              marginBottom: 0,
            }}
          >
            The score is a decision-support
            indicator, not a guarantee of future
            investment performance.
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
          + How can I improve it?
        </summary>

        <div
          style={{
            marginTop: 14,
            color:
              "var(--color-text-secondary, #b7bac5)",
            lineHeight: 1.65,
          }}
        >

          <ul
            style={{
              paddingLeft: 20,
              marginBottom: 0,
            }}
          >

            <li>
              Improve sustainable rental
              income or reduce recurring
              expenses to strengthen cashflow.
            </li>

            <li>
              Reduce outstanding debt over
              time to improve leverage and
              equity.
            </li>

            <li>
              Maintain a healthy rental yield
              relative to the property's value.
            </li>

            <li>
              Keep reliable market valuations
              updated so Aequitas can assess
              equity and capital growth more
              accurately.
            </li>

          </ul>

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
          + Data completeness
        </summary>

        <div
          style={{
            marginTop: 14,
            color:
              "var(--color-text-secondary, #b7bac5)",
            lineHeight: 1.65,
          }}
        >

          <h3
            style={{
              marginTop: 0,
            }}
          >
            📋 {dataScore}% complete
          </h3>

          <p>
            Aequitas currently has{" "}
            <strong>
              {dataCompleted}
            </strong>{" "}
            of{" "}
            <strong>
              {dataTotal}
            </strong>{" "}
            key information fields available.
          </p>

          <p
            style={{
              marginBottom: 0,
            }}
          >
            Data completeness does not affect
            the Investment Health score directly.
            It tells you how much information
            Aequitas has available to make its
            analysis.
          </p>

        </div>

      </details>

    </div>
  );
}