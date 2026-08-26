import { Link } from "react-router-dom";
import useIntelligence from "../../hooks/useIntelligence";

export default function ExecutiveBriefCard() {
  const { score, opportunities } = useIntelligence();

  const today = new Date();

  const date = today.toLocaleDateString("en-MY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let focus = {
    status: "healthy",
    icon: "✅",
    title: "Portfolio Healthy",
    property: "",
    message:
      "No immediate investment action is required today.",
    button: "View Portfolio",
    link: "/portfolio",
  };

  if (opportunities.refinance.length > 0) {
    const property = opportunities.refinance[0];

    focus = {
      status: "action",
      icon: "🏦",
      title: "Refinancing Opportunity",
      property: property.projectName || property.name || "",
      message:
        "This property appears suitable for refinancing based on your current portfolio.",
      button: "Review",
      link: "/opportunities",
    };
  } else if (opportunities.equity.length > 0) {
    const property = opportunities.equity[0];

    focus = {
      status: "action",
      icon: "📈",
      title: "Equity Release",
      property: property.projectName || property.name || "",
      message:
        "This property has strong available equity for future investment planning.",
      button: "Review",
      link: "/opportunities",
    };
  } else if (opportunities.rental.length > 0) {
    const property = opportunities.rental[0];

    focus = {
      status: "action",
      icon: "🏠",
      title: "Rental Optimisation",
      property: property.projectName || property.name || "",
      message:
        "Rental performance deserves review to improve portfolio income.",
      button: "Review",
      link: "/opportunities",
    };
  } else if (opportunities.sell.length > 0) {
    const property = opportunities.sell[0];

    focus = {
      status: "action",
      icon: "🎯",
      title: "Sell Opportunity",
      property: property.projectName || property.name || "",
      message:
        "Strong appreciation suggests this property may be approaching an exit opportunity.",
      button: "Review",
      link: "/opportunities",
    };
  }

  return (
    <div className="dashboard-card" style={{ marginBottom: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div>
          <div
            style={{
              fontSize: ".85rem",
              opacity: .65,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Executive Brief
          </div>

          <h2
            style={{
              margin: "8px 0 0",
            }}
          >
            {date}
          </h2>
        </div>

        <div
          style={{
            textAlign: "right",
          }}
        >
          <div
            style={{
              fontSize: ".85rem",
              opacity: .65,
            }}
          >
            Portfolio Score
          </div>

          <div
            style={{
              fontSize: "2.7rem",
              fontWeight: 700,
              color: "#4f8cff",
            }}
          >
            {score.score}
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,.08)",
          paddingTop: 24,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 999,
            background:
              focus.status === "healthy"
                ? "#15391d"
                : "#3b2a0b",
            color:
              focus.status === "healthy"
                ? "#5de28a"
                : "#f4c542",
            fontWeight: 600,
            fontSize: ".85rem",
            marginBottom: 22,
          }}
        >
          {focus.status === "healthy"
            ? "🟢 Portfolio Healthy"
            : "🟡 Action Recommended"}
        </div>

        <h3
          style={{
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span>{focus.icon}</span>

          {focus.title}
        </h3>

        {focus.property && (
          <div
            style={{
              marginTop: 14,
              fontWeight: 700,
              color: "#4f8cff",
              fontSize: "1.05rem",
            }}
          >
            {focus.property}
          </div>
        )}

        <p
          style={{
            marginTop: 14,
            lineHeight: 1.7,
            opacity: .8,
          }}
        >
          {focus.message}
        </p>

        <Link to={focus.link}>
          <button
            className="primary-button"
            style={{
              marginTop: 18,
            }}
          >
            {focus.button}
          </button>
        </Link>
      </div>
    </div>
  );
}