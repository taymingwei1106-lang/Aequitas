export default function ResultCard({
  title,
  value,
  subtitle = "",
  icon = "",
  status = "default",
}) {
  const colorMap = {
    default: "#111827",
    positive: "#16a34a",
    negative: "#dc2626",
    warning: "#d97706",
    info: "#2563eb",
  };

  return (
    <div
      className="dashboard-card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span className="page-subtitle">
          {title}
        </span>

        {icon && (
          <span
            style={{
              fontSize: "1.4rem",
            }}
          >
            {icon}
          </span>
        )}
      </div>

      <h2
        style={{
          margin: 0,
          color: colorMap[status] ?? colorMap.default,
        }}
      >
        {value}
      </h2>

      {subtitle && (
        <small
          style={{
            opacity: 0.7,
          }}
        >
          {subtitle}
        </small>
      )}
    </div>
  );
}