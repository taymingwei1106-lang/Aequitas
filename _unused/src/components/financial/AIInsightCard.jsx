export default function AIInsightCard({
  type = "info",
  title,
  message,
}) {
  const config = {
    success: {
      icon: "🟢",
      color: "#16a34a",
      background: "#ecfdf5",
    },

    warning: {
      icon: "🟡",
      color: "#d97706",
      background: "#fffbeb",
    },

    danger: {
      icon: "🔴",
      color: "#dc2626",
      background: "#fef2f2",
    },

    info: {
      icon: "🔵",
      color: "#2563eb",
      background: "#eff6ff",
    },
  };

  const style = config[type] ?? config.info;

  return (
    <div
      className="dashboard-card"
      style={{
        background: style.background,
        borderLeft: `6px solid ${style.color}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: "1.5rem",
          }}
        >
          {style.icon}
        </span>

        <h3
          style={{
            margin: 0,
            color: style.color,
          }}
        >
          {title}
        </h3>
      </div>

      <p
        style={{
          margin: 0,
          lineHeight: 1.7,
        }}
      >
        {message}
      </p>
    </div>
  );
}