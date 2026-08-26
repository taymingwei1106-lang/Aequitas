import formatCurrency from "../utils/formatCurrency";
import { generateOpportunities } from "../services/opportunityEngine";

export default function ExecutiveSummary({
  property,
  analytics,
}) {
  const cashflow =
    Number(
      analytics?.profit?.monthlyProfit ?? 0
    );

  const purchase =
    Number(
      analytics?.investment?.purchasePrice ??
      property?.purchasePrice ??
      0
    );

  const market =
    Number(
      analytics?.equity?.market ??
      property?.marketValue ??
      purchase
    );

  const capitalGrowth =
    market - purchase;

  const roi =
    Number(
      analytics?.investment?.roi ?? 0
    );

  const yieldValue =
    Number(
      analytics?.rentalYield?.grossYield ?? 0
    );

  const health =
    Number(
      analytics?.health?.score ?? 0
    );

  /*
   * Use the same Opportunity Engine as the
   * Opportunity Finder.
   *
   * This prevents the Executive Summary from
   * creating its own conflicting recommendation.
   */
  const opportunityResult =
    generateOpportunities({
      properties: [property],
    });

  const hasRentalOpportunity =
    opportunityResult.rental.length > 0;

  const hasRefinanceOpportunity =
    opportunityResult.refinance.length > 0;

  const hasEquityOpportunity =
    opportunityResult.equity.length > 0;

  const hasSellOpportunity =
    opportunityResult.sell.length > 0;

  function getRecommendation() {
    if (hasRentalOpportunity) {
      return {
        icon: "🏠",
        label: "Rental Performance Review",
        message:
          "This property is showing negative monthly cashflow. Reviewing rental income and recurring expenses may improve its contribution to the portfolio.",
      };
    }

    if (hasRefinanceOpportunity) {
      return {
        icon: "💰",
        label: "Financing Review",
        message:
          "Current financing conditions may be worth reviewing. Aequitas recommends comparing the available options before taking action.",
      };
    }

    if (hasEquityOpportunity) {
      return {
        icon: "📈",
        label: "Equity Opportunity",
        message:
          "This property has meaningful equity that may create future investment flexibility.",
      };
    }

    if (hasSellOpportunity) {
      return {
        icon: "🎯",
        label: "Exit Review",
        message:
          "The property is showing a significant appreciation signal that may justify reviewing your longer-term exit strategy.",
      };
    }

    return {
      icon: "🟡",
      label: "Monitor Investment",
      message:
        "No immediate action is recommended. Continue monitoring cashflow, financing and property value as the investment develops.",
    };
  }

  function getHealthLabel() {
    if (health >= 80) {
      return {
        text: "Strong Position",
        icon: "🟢",
      };
    }

    if (health >= 60) {
      return {
        text: "Stable Position",
        icon: "🟡",
      };
    }

    if (health >= 40) {
      return {
        text: "Needs Attention",
        icon: "🟠",
      };
    }

    return {
      text: "Higher Risk Position",
      icon: "🔴",
    };
  }

  const recommendation =
    getRecommendation();

  const healthStatus =
    getHealthLabel();

  return (
    <div className="card">

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 24,
        }}
      >

        <div>

          <p className="page-subtitle">
            Property Command Centre
          </p>

          <h1
            style={{
              margin: "6px 0",
            }}
          >
            🏢 {property.projectName}
          </h1>

          <h3
            style={{
              marginTop: 4,
            }}
          >
            {healthStatus.icon}{" "}
            {healthStatus.text}
          </h3>

        </div>

        <div
          style={{
            textAlign: "right",
          }}
        >

          <div className="card-label">
            Investment Health
          </div>

          <h1
            style={{
              margin: 0,
              color:
                health >= 80
                  ? "#22C55E"
                  : health >= 60
                  ? "#FACC15"
                  : health >= 40
                  ? "#F97316"
                  : "#EF4444",
            }}
          >
            {health}/100
          </h1>

        </div>

      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",
          gap: 20,
          marginTop: 30,
        }}
      >

        <div>

          <div className="card-label">
            Monthly Cashflow
          </div>

          <h2
            style={{
              color:
                cashflow >= 0
                  ? "#22C55E"
                  : "#EF4444",
            }}
          >
            RM {formatCurrency(cashflow)}
          </h2>

        </div>

        <div>

          <div className="card-label">
            Capital Growth
          </div>

          <h2>
            RM {formatCurrency(capitalGrowth)}
          </h2>

        </div>

        <div>

          <div className="card-label">
            Rental Yield
          </div>

          <h2>
            {yieldValue.toFixed(2)}%
          </h2>

        </div>

        <div>

          <div className="card-label">
            ROI
          </div>

          <h2>
            {roi.toFixed(2)}%
          </h2>

        </div>

      </div>

      <div
        style={{
          marginTop: 24,
          padding: 18,
          borderRadius: 12,
          background: "#1d2533",
        }}
      >

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >

          <strong>
            {recommendation.icon}{" "}
            {recommendation.label}
          </strong>

        </div>

        <p
          style={{
            marginTop: 10,
            marginBottom: 0,
            lineHeight: 1.6,
          }}
        >
          {recommendation.message}
        </p>

      </div>

    </div>
  );
}