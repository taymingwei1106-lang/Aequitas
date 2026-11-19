export default function OpportunityCard({
  icon,
  title,
  description,
  count = 0,
  priority = "None",
  buttonText = "Analyse",
  onClick,
}) {
  return (
    <div
      className="dashboard-card"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: 280,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "1.15rem",
          }}
        >
          {icon} {title}
        </h2>

        <span
          style={{
            fontSize: ".8rem",
            padding: "4px 10px",
            borderRadius: 999,
            background: "#202532",
            color: "#8ab4ff",
          }}
        >
          {priority}
        </span>
      </div>

      <p
        style={{
          opacity: 0.75,
          lineHeight: 1.6,
          minHeight: 55,
        }}
      >
        {description}
      </p>

      <div
        style={{
          marginTop: 20,
          marginBottom: 8,
          fontSize: "2.8rem",
          fontWeight: 700,
          color: "#4f8cff",
        }}
      >
        {count}
      </div>

      <div
        style={{
          opacity: 0.7,
          marginBottom: "auto",
        }}
      >
        Opportunities Found
      </div>

      <button
        className="primary-button"
        style={{
          marginTop: 24,
        }}
        onClick={onClick}
      >
        {buttonText}
      </button>
    </div>
  );
}