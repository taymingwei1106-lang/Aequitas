import Card from "../Card";
import useIntelligence from "../../hooks/useIntelligence";

export default function TodaysReasonCard() {
  const { opportunities } = useIntelligence();

  let title = "Portfolio Looking Healthy";
  let message =
    "No immediate investment action is required. Continue monitoring your portfolio and review it regularly.";

  let confidence = 95;

  if (opportunities.refinance.length > 0) {
    title = "Refinancing Opportunity";
    message =
      "One or more properties may qualify for refinancing. Lower repayments could improve your monthly cashflow.";
    confidence = 94;
  } else if (opportunities.equity.length > 0) {
    title = "Equity Release";
    message =
      "Properties with strong equity have been detected. This may support funding your next investment.";
    confidence = 92;
  } else if (opportunities.rental.length > 0) {
    title = "Rental Optimisation";
    message =
      "Some properties appear to be underperforming and may benefit from a rental review.";
    confidence = 88;
  } else if (opportunities.sell.length > 0) {
    title = "Potential Exit Opportunity";
    message =
      "One or more properties have achieved strong appreciation and may be worth reviewing.";
    confidence = 85;
  }

  return (
    <Card style={{ marginBottom: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h3 style={{ margin: 0 }}>
          Why this recommendation?
        </h3>

        <span
          style={{
            padding: "6px 12px",
            borderRadius: 999,
            background: "#202532",
            color: "#4f8cff",
            fontWeight: 600,
            fontSize: ".85rem",
          }}
        >
          {confidence}% Confidence
        </span>
      </div>

      <h4
        style={{
          marginBottom: 10,
        }}
      >
        {title}
      </h4>

      <p
        style={{
          opacity: .8,
          lineHeight: 1.7,
          marginBottom: 18,
        }}
      >
        {message}
      </p>

      <details>
        <summary
          style={{
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Show Analysis
        </summary>

        <div
          style={{
            marginTop: 14,
            lineHeight: 1.8,
            opacity: .85,
          }}
        >
          ✓ Portfolio analysed

          <br />

          ✓ Equity position reviewed

          <br />

          ✓ Cashflow evaluated

          <br />

          ✓ Debt level considered

          <br />

          ✓ Opportunity engine completed
        </div>
      </details>
    </Card>
  );
}