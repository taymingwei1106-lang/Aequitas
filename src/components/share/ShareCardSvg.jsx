import { forwardRef } from "react";

import { plainRM, signedPct, signedRM } from "../../utils/shareCard";
import { CARD_HEIGHT, CARD_WIDTH, DISPLAY_FONT, THEMES } from "./shareCardThemes";

/*
 * The shareable portfolio card, drawn as one 1080 × 1350 SVG (Instagram
 * portrait). The same SVG is shown on screen and rasterised for "Save
 * image", so what you see is exactly what you share.
 *
 * The chart is a skyline: one building per month, its height the
 * portfolio's net cashflow that month. A month that lost money is drawn
 * as a basement below the ground line.
 */

const PAD = 88;
const INNER = CARD_WIDTH - PAD * 2;
const FONT = `'${DISPLAY_FONT}', 'Segoe UI', -apple-system, system-ui, sans-serif`;
const NUM = { fontVariantNumeric: "tabular-nums" };

function heroFor(data, hero, hide) {
  if (hero === "equity") {
    return {
      label: "Equity built",
      value: hide ? (data.equityPct !== null ? `${Math.round(data.equityPct)}%` : "RM ••••••") : plainRM(data.equity),
      tone: "text",
      chip: hide ? "of portfolio value owned" : data.equityPct !== null ? `${Math.round(data.equityPct)}% of value owned` : null,
      chipArrow: false,
    };
  }

  const isGain = hero === "gain";
  const value = isGain ? data.gain ?? 0 : data.totalReturn;
  const pct = isGain ? data.gainPct : data.totalReturnPct;
  const pctText = signedPct(pct);

  return {
    label: isGain ? "Capital gain" : "Portfolio return",
    value: hide ? pctText || "RM ••••••" : signedRM(value),
    tone: value > 0 ? "positive" : value < 0 ? "negative" : "text",
    chip: pctText ? (hide ? "on purchase price" : `${pctText} on purchase price`) : null,
    chipArrow: !hide && pct !== null,
    up: value >= 0,
  };
}

function footnoteFor(data, hero) {
  if (hero === "equity") {
    return data.unvalued.length ? "Value at purchase price where no valuation is recorded" : "";
  }
  if (hero === "gain") {
    return data.unvalued.length
      ? `Excludes ${data.unvalued.length} propert${data.unvalued.length === 1 ? "y" : "ies"} without a valuation`
      : "";
  }
  if (data.valuedCount === 0) return "Cashflow collected so far. No valuations recorded yet";
  if (data.unvalued.length) return "Gain counts valued properties only, plus all cashflow collected";
  return "Capital gain plus cashflow collected";
}

/* Deterministic "lit window" pattern so the picture is the same every time. */
function lit(i, r, c) {
  return (i * 7 + r * 3 + c * 5 + ((r * c) % 3)) % 5 !== 0;
}

function Skyline({ series, theme, top, height }) {
  if (series.length < 2) return null;

  const values = series.map((s) => s.value);
  const max = Math.max(0, ...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;
  const y = (v) => top + ((max - v) / span) * height;
  const ground = y(0);

  const n = series.length;
  const gap = n > 8 ? 14 : 22;
  const w = (INNER - gap * (n - 1)) / n;

  return (
    <g>
      {series.map((s, i) => {
        const x = PAD + i * (w + gap);
        const positive = s.value >= 0;
        // Keep a sliver visible for a near-zero month.
        const h = Math.max(6, Math.abs(y(s.value) - ground));
        const yTop = positive ? ground - h : ground;
        const setback = positive && i % 3 === 1 && h > 90;
        const cols = Math.max(1, Math.floor((w - 20) / 22));
        const rows = positive ? Math.max(0, Math.floor((h - (setback ? 54 : 26)) / 30)) : 0;
        const winW = 9;
        const colStep = (w - 20 - winW) / Math.max(1, cols - 1);

        return (
          <g key={s.month}>
            {setback && <rect x={x + w * 0.22} y={yTop - 26} width={w * 0.56} height={28} fill={theme.building} />}
            <rect
              x={x}
              y={yTop}
              width={w}
              height={h}
              rx={positive ? 3 : 2}
              fill={positive ? theme.building : theme.negative}
              fillOpacity={positive ? 1 : 0.32}
            />
            {Array.from({ length: rows }).map((_, r) =>
              Array.from({ length: cols }).map((__, c) =>
                lit(i, r, c) ? (
                  <rect
                    key={`${r}-${c}`}
                    x={x + 10 + (cols === 1 ? (w - 20 - winW) / 2 : c * colStep)}
                    y={yTop + 18 + r * 30}
                    width={winW}
                    height={14}
                    rx={1.5}
                    fill={theme.window}
                    fillOpacity={0.85}
                  />
                ) : null
              )
            )}
          </g>
        );
      })}
      <line x1={PAD - 24} x2={CARD_WIDTH - PAD + 24} y1={ground} y2={ground} stroke={theme.muted} strokeWidth={2} />
    </g>
  );
}

const ShareCardSvg = forwardRef(function ShareCardSvg(
  { data, hero = "return", themeId = "dusk", hideAmounts = false, showNames = true, dateLabel, fontCss = "" },
  ref
) {
  const theme = THEMES[themeId] || THEMES.dusk;
  const h = heroFor(data, hero, hideAmounts);
  const heroColor = h.tone === "positive" ? theme.positive : h.tone === "negative" ? theme.negative : theme.text;
  const heroSize = Math.min(160, Math.floor(INNER / (h.value.length * 0.6)));
  const footnote = footnoteFor(data, hero);

  const stats = [
    hideAmounts
      ? { label: "Positive months", value: `${data.positiveMonths} of ${data.cashflowMonths}` }
      : { label: "Cashflow collected", value: signedRM(data.cashflowCollected) },
    hero === "equity"
      ? hideAmounts
        ? { label: "Months recorded", value: String(data.cashflowMonths) }
        : { label: "Monthly cashflow", value: signedRM(data.monthlyCashflow) }
      : hideAmounts
      ? { label: "Equity", value: data.equityPct !== null ? `${Math.round(data.equityPct)}% owned` : "—" }
      : { label: "Equity", value: plainRM(data.equity) },
  ];
  const statSize = Math.min(56, Math.floor(420 / (Math.max(...stats.map((s) => s.value.length)) * 0.6)));

  const countLabel = `${data.count} ${data.count === 1 ? "property" : "properties"}`;
  let names = showNames ? `${countLabel}: ${data.names.join(", ")}` : countLabel;
  if (names.length > 60) names = `${names.slice(0, 57).trimEnd()}…`;

  const chipWidth = h.chip ? h.chip.length * 15.5 + (h.chipArrow ? 74 : 48) : 0;
  const skyTop = 690;
  const skyHeight = 250;

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
      width={CARD_WIDTH}
      height={CARD_HEIGHT}
      role="img"
      aria-label={`${h.label} ${h.value}`}
      style={{ display: "block", width: "100%", height: "auto" }}
      fontFamily={FONT}
    >
      <defs>
        {fontCss && <style>{fontCss}</style>}
        <linearGradient id="sc-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={theme.bgTop} />
          <stop offset="1" stopColor={theme.bgBottom} />
        </linearGradient>
        <radialGradient id="sc-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={theme.glow} stopOpacity={theme.glowOpacity} />
          <stop offset="1" stopColor={theme.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sc-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5B9BFF" />
          <stop offset="1" stopColor="#2F5FE0" />
        </linearGradient>
      </defs>

      <rect width={CARD_WIDTH} height={CARD_HEIGHT} fill="url(#sc-bg)" />
      <ellipse cx={CARD_WIDTH / 2} cy={skyTop + skyHeight} rx={640} ry={260} fill="url(#sc-glow)" />

      {/* Header */}
      <rect x={PAD} y={96} width={60} height={60} rx={16} fill="url(#sc-logo)" />
      <text x={PAD + 30} y={140} textAnchor="middle" fontSize={38} fontWeight={800} fill="#FFFFFF">
        A
      </text>
      <rect x={PAD + 19} y={145} width={22} height={4} rx={2} fill="#FFFFFF" />
      <text x={PAD + 80} y={139} fontSize={36} fontWeight={700} fill={theme.text} letterSpacing={-0.5}>
        Aequitas
      </text>
      <text x={CARD_WIDTH - PAD} y={139} textAnchor="end" fontSize={28} fontWeight={500} fill={theme.muted} style={NUM}>
        {dateLabel}
      </text>

      {/* Hero */}
      <text x={PAD} y={318} fontSize={42} fontWeight={500} fill={theme.muted}>
        {h.label}
      </text>
      <text
        x={PAD - 6}
        y={318 + heroSize * 0.98}
        fontSize={heroSize}
        fontWeight={800}
        fill={heroColor}
        letterSpacing={-heroSize * 0.035}
        style={NUM}
      >
        {h.value}
      </text>

      {h.chip && (
        <g transform={`translate(${PAD}, ${318 + heroSize * 0.98 + 44})`}>
          <rect width={chipWidth} height={62} rx={31} fill={theme.chip} />
          {h.chipArrow && (
            <path
              d={h.up ? "M28 40 L40 20 L52 40 Z" : "M28 22 L40 42 L52 22 Z"}
              fill={h.up ? theme.positive : theme.negative}
            />
          )}
          <text x={h.chipArrow ? 64 : 26} y={41} fontSize={28} fontWeight={600} fill={theme.text} style={NUM}>
            {h.chip}
          </text>
        </g>
      )}

      {/* Skyline */}
      {data.series.length > 1 && (
        <>
          <text x={PAD} y={skyTop - 34} fontSize={26} fontWeight={500} fill={theme.muted}>
            Net cashflow each month
          </text>
          <Skyline series={data.series} theme={theme} top={skyTop} height={skyHeight} />
          <text x={PAD} y={skyTop + skyHeight + 48} fontSize={24} fill={theme.muted} style={NUM}>
            {new Date(`${data.series[0].month}-01T00:00:00`).toLocaleDateString("en-MY", { month: "short", year: "numeric" })}
          </text>
          <text x={CARD_WIDTH - PAD} y={skyTop + skyHeight + 48} textAnchor="end" fontSize={24} fill={theme.muted} style={NUM}>
            {new Date(`${data.series[data.series.length - 1].month}-01T00:00:00`).toLocaleDateString("en-MY", {
              month: "short",
              year: "numeric",
            })}
          </text>
        </>
      )}

      {/* Stats */}
      <line x1={PAD} x2={CARD_WIDTH - PAD} y1={1040} y2={1040} stroke={theme.faint} strokeWidth={2} />
      {stats.map((stat, i) => {
        const x = PAD + i * (INNER / 2);
        return (
          <g key={stat.label}>
            <text x={x} y={1100} fontSize={26} fontWeight={500} fill={theme.muted}>
              {stat.label}
            </text>
            <text x={x} y={1100 + statSize + 14} fontSize={statSize} fontWeight={700} fill={theme.text} style={NUM}>
              {stat.value}
            </text>
          </g>
        );
      })}

      {/* Footer */}
      <text x={PAD} y={1248} fontSize={26} fontWeight={500} fill={theme.text}>
        {names}
      </text>
      <text x={PAD} y={1288} fontSize={22} fill={theme.muted}>
        {footnote ? `${footnote}. ` : ""}Tracked with Aequitas
      </text>
    </svg>
  );
});

export default ShareCardSvg;
