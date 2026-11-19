export default function PageHeader({
  title,
  description,
  action,
}) {
  return (
    <div
      style={{
        marginBottom: 28,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
            }}
          >
            {title}
          </h1>

          {description && (
            <p
              style={{
                marginTop: 10,
                opacity: .75,
                lineHeight: 1.7,
                maxWidth: 720,
              }}
            >
              {description}
            </p>
          )}
        </div>

        {action}
      </div>
    </div>
  );
}