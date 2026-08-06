export default function Divider({
  margin = "24px 0",
}) {
  return (
    <div
      style={{
        height: "1px",
        background: "var(--color-border)",
        margin,
      }}
    />
  );
}