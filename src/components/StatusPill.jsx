import { TONES } from "../utils/statusTone";

export default function StatusPill({ tone = "neutral", children, large = false }) {
  const style = TONES[tone] || TONES.neutral;

  return (
    <span
      style={{
        display: "inline-block",
        padding: large ? "8px 16px" : "6px 12px",
        borderRadius: 999,
        fontSize: large ? 15 : 13,
        fontWeight: 700,
        color: style.color,
        background: style.background,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
