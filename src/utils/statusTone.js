/* Colours and tones for assessment statuses (shared by StatusPill and lists). */

export const TONES = {
  positive: { color: "var(--color-success)", background: "rgba(34,197,94,0.12)" },
  caution: { color: "var(--color-warning)", background: "rgba(245,158,11,0.12)" },
  negative: { color: "var(--color-negative)", background: "rgba(249,115,22,0.14)" },
  neutral: { color: "var(--color-text)", background: "rgba(203,213,225,0.10)" },
};

export const STATUS_TONE_BY_KEY = {
  ok: "positive",
  watch: "caution",
  review: "negative",
  unknown: "neutral",
};

export function toneColor(tone) {
  return (TONES[tone] || TONES.neutral).color;
}
