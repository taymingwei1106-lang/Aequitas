import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Card from "../components/Card";
import ShareCardSvg from "../components/share/ShareCardSvg";
import { CARD_HEIGHT, CARD_WIDTH, DISPLAY_FONT, THEMES } from "../components/share/shareCardThemes";
import { getProperties } from "../services/storage";
import { buildShareData } from "../utils/shareCard";
import { downloadBlob } from "../utils/xlsxWriter";

/*
 * Share card — a portfolio snapshot made for screenshots and Instagram.
 *
 * Choices (headline, style, hide amounts, show names) are remembered on
 * this device. "Hide amounts" swaps every RM figure for percentages or
 * counts, so the card can be posted without revealing the money.
 */

const FONT_URL = "/fonts/bricolage-grotesque.woff2";
const PREFS_KEY = "aequitas-share-card";

const HEROES = [
  { id: "return", label: "Return" },
  { id: "gain", label: "Capital gain" },
  { id: "equity", label: "Equity" },
];

function readPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function writePrefs(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* storage full or blocked: the choice just isn't remembered */
  }
}

let fontCssPromise = null;

/* The font as an embedded data URL, so the saved image uses it too. */
function loadFontCss() {
  if (!fontCssPromise) {
    fontCssPromise = fetch(FONT_URL)
      .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error("font"))))
      .then((buffer) => {
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.length; i += 0x8000) {
          binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
        }
        return `@font-face{font-family:'${DISPLAY_FONT}';src:url(data:font/woff2;base64,${btoa(
          binary
        )}) format('woff2');font-weight:200 800;}`;
      })
      .catch(() => "");
  }
  return fontCssPromise;
}

async function renderPng(svg, fontCss) {
  const clone = svg.cloneNode(true);
  clone.setAttribute("width", CARD_WIDTH);
  clone.setAttribute("height", CARD_HEIGHT);
  clone.removeAttribute("style");
  if (fontCss) {
    const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent = fontCss;
    clone.querySelector("defs")?.prepend(style);
  }

  const xml = new XMLSerializer().serializeToString(clone);
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  // Safari sometimes paints an SVG before its embedded font is ready; draw again after a beat.
  ctx.drawImage(img, 0, 0);
  await new Promise((resolve) => setTimeout(resolve, 150));
  ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  ctx.drawImage(img, 0, 0);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

function Segmented({ options, value, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={option.disabled}
            title={option.title}
            onClick={() => onChange(option.id)}
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border-strong)"}`,
              background: active ? "var(--color-primary-soft)" : "transparent",
              color: option.disabled ? "var(--color-text-muted)" : "var(--color-text)",
              fontWeight: 600,
              fontSize: 14,
              cursor: option.disabled ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {option.swatch && (
              <span
                aria-hidden="true"
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: option.swatch,
                  border: "1px solid var(--color-border-strong)",
                }}
              />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({ checked, onChange, label, hint }) {
  return (
    <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 20, height: 20, marginTop: 2 }}
      />
      <span>
        <strong style={{ fontSize: 15 }}>{label}</strong>
        <span style={{ display: "block", fontSize: 13, color: "var(--color-text-secondary)" }}>{hint}</span>
      </span>
    </label>
  );
}

export default function ShareCard() {
  const [properties] = useState(() => getProperties());
  const data = useMemo(() => buildShareData(properties), [properties]);
  const saved = useMemo(() => readPrefs(), []);

  const [hero, setHero] = useState(() => {
    const wanted = saved.hero || (data.valuedCount > 0 ? "gain" : "return");
    return wanted === "gain" && data.valuedCount === 0 ? "return" : wanted;
  });
  const [themeId, setThemeId] = useState(() => (THEMES[saved.themeId] ? saved.themeId : "dusk"));
  const [hideAmounts, setHideAmounts] = useState(Boolean(saved.hideAmounts));
  const [showNames, setShowNames] = useState(saved.showNames !== false);
  const [png, setPng] = useState(null);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const svgRef = useRef(null);

  const dateLabel = new Date().toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
  const canShareFiles =
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [new File([""], "x.png", { type: "image/png" })] });

  useEffect(() => {
    writePrefs({ hero, themeId, hideAmounts, showNames });
  }, [hero, themeId, hideAmounts, showNames]);

  // Load the display font for the on-screen card.
  useEffect(() => {
    if (typeof FontFace === "undefined" || !document.fonts) return;
    const face = new FontFace(DISPLAY_FONT, `url(${FONT_URL})`, { weight: "200 800" });
    face
      .load()
      .then((loaded) => document.fonts.add(loaded))
      .catch(() => {});
  }, []);

  // Prepare the image ahead of the tap: iPhone only allows sharing straight from a tap.
  useEffect(() => {
    if (!svgRef.current || properties.length === 0) return undefined;
    let cancelled = false;
    setPng(null);
    const timer = setTimeout(async () => {
      try {
        const fontCss = await loadFontCss();
        const blob = await renderPng(svgRef.current, fontCss);
        if (!cancelled) setPng(blob);
      } catch {
        if (!cancelled) setPng(null);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [hero, themeId, hideAmounts, showNames, data, properties.length]);

  const filename = `Aequitas-portfolio-${new Date().toISOString().slice(0, 10)}.png`;

  async function share() {
    if (!png) return;
    setMessage("");
    const file = new File([png], filename, { type: "image/png" });
    try {
      await navigator.share({ files: [file], title: "My property portfolio" });
    } catch (error) {
      if (error?.name !== "AbortError") setMessage("Sharing didn't work here. Use Download image instead.");
    }
  }

  async function download() {
    setWorking(true);
    try {
      const blob = png || (await renderPng(svgRef.current, await loadFontCss()));
      downloadBlob(blob, filename);
    } catch {
      setMessage("The image couldn't be created in this browser. Take a screenshot of the card instead.");
    } finally {
      setWorking(false);
    }
  }

  if (properties.length === 0) {
    return (
      <div>
        <section className="page-header">
          <h1 className="page-title">Share card</h1>
        </section>
        <Card>
          <h2>Nothing to share yet</h2>
          <p className="page-subtitle">Add a property and record a few monthly check-ins to build your card.</p>
          <Link to="/add">
            <button className="primary-button">Add Property</button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <section className="page-header">
        <Link to="/portfolio" className="page-subtitle">
          ← Back to Portfolio
        </Link>
        <h1 className="page-title" style={{ marginTop: 12 }}>
          Share card
        </h1>
        <p className="page-subtitle">
          A snapshot of your portfolio to post or send. Hide the amounts to share percentages only.
        </p>
      </section>

      <div className="share-layout">
        <div className="share-preview">
          <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: "var(--shadow-lg)" }}>
            <ShareCardSvg
              ref={svgRef}
              data={data}
              hero={hero}
              themeId={themeId}
              hideAmounts={hideAmounts}
              showNames={showNames}
              dateLabel={dateLabel}
            />
          </div>
        </div>

        <div style={{ display: "grid", gap: 20, alignContent: "start" }}>
          <div style={{ display: "grid", gap: 10 }}>
            {canShareFiles && (
              <button type="button" className="primary-button" onClick={share} disabled={!png}>
                {png ? "Share or save to Photos" : "Preparing image…"}
              </button>
            )}
            <button
              type="button"
              className={canShareFiles ? "btn-secondary" : "primary-button"}
              onClick={download}
              disabled={working}
              style={canShareFiles ? { padding: "14px 18px", borderRadius: 16, fontWeight: 600, cursor: "pointer" } : undefined}
            >
              {working ? "Creating image…" : "Download image"}
            </button>
            {message && <p style={{ margin: 0, fontSize: 13, color: "var(--color-warning)" }}>{message}</p>}
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <strong style={{ fontSize: 14 }}>Headline</strong>
            <Segmented
              label="Headline"
              value={hero}
              onChange={setHero}
              options={HEROES.map((option) =>
                option.id === "gain" && data.valuedCount === 0
                  ? { ...option, disabled: true, title: "Record a market value to show capital gain" }
                  : option
              )}
            />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <strong style={{ fontSize: 14 }}>Style</strong>
            <Segmented
              label="Style"
              value={themeId}
              onChange={setThemeId}
              options={Object.entries(THEMES).map(([id, theme]) => ({
                id,
                label: theme.label,
                swatch: `linear-gradient(135deg, ${theme.bgTop}, ${theme.bgBottom})`,
              }))}
            />
          </div>

          <Toggle
            checked={hideAmounts}
            onChange={setHideAmounts}
            label="Hide amounts"
            hint="Show percentages and counts instead of RM figures."
          />
          <Toggle
            checked={showNames}
            onChange={setShowNames}
            label="Show property names"
            hint="Turn off to keep which properties you own private."
          />

          {data.unvalued.length > 0 && (
            <div
              style={{
                padding: 14,
                borderRadius: 12,
                border: "1px solid var(--color-border-strong)",
                background: "var(--color-surface-sunken)",
                fontSize: 13,
                color: "var(--color-text-secondary)",
                lineHeight: 1.6,
              }}
            >
              {data.valuedCount === 0 ? "No property has" : `${data.unvalued.join(", ")} ${data.unvalued.length === 1 ? "has" : "have"}`}{" "}
              a market value yet, so capital gain {data.valuedCount === 0 ? "can't be shown" : "leaves them out"}. Record
              one in a monthly check-in (from a bank valuation or recent transacted prices nearby).
            </div>
          )}

          <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
            Return is capital gain on valued properties plus the cashflow recorded in your check-ins. Percentages are on
            the net purchase price. The card is made on this device; nothing is uploaded.
          </p>
        </div>
      </div>
    </div>
  );
}
