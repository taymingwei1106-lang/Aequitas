export default function AIAdvisor({ analytics }) {

  const cashflow =
    analytics.profit.monthlyProfit;

  const yieldValue =
    analytics.rentalYield.grossYield;

  const equity =
    analytics.equity.equity;

  const growth =
    analytics.equity.market -
    analytics.investment.purchasePrice;

  let recommendation =
    "Continue monitoring this investment.";

  if (cashflow > 0 && growth > 0)
    recommendation =
      "Continue holding. The investment is performing well.";

  if (cashflow < 0)
    recommendation =
      "Review expenses or increase rental income.";

  return (

    <div className="card">

      <h3
        style={{
          marginTop: 0,
        }}
      >
        🧠 Aequitas Advisor
      </h3>

      <p>

        Overall, this investment is

        {

          cashflow >= 0

            ? " generating positive monthly cashflow."

            : " currently operating at a monthly loss."

        }

      </p>

      <p>

        Rental yield currently stands at

        <strong>

          {" "}

          {yieldValue.toFixed(2)}%

        </strong>

        .

      </p>

      <p>

        Current equity has reached

        <strong>

          {" "}

          RM {equity.toLocaleString()}

        </strong>

        .

      </p>

      <p>

        Capital appreciation totals

        <strong>

          {" "}

          RM {growth.toLocaleString()}

        </strong>

        .

      </p>

      <div
        style={{
          marginTop: 24,
          padding: 18,
          borderRadius: 12,
          background: "#1D2533",
        }}
      >

        <strong>

          Recommendation

        </strong>

        <p
          style={{
            marginBottom: 0,
            marginTop: 10,
          }}
        >

          {recommendation}

        </p>

      </div>

    </div>

  );

}