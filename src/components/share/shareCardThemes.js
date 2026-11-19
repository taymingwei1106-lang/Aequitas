/* Size, font and colour themes for the share card (see ShareCardSvg). */

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;
export const DISPLAY_FONT = "Aequitas Display";

export const THEMES = {
  dusk: {
    label: "Dusk",
    bgTop: "#140F35",
    bgBottom: "#3B2368",
    glow: "#FF9F43",
    glowOpacity: 0.32,
    text: "#FFF6E9",
    muted: "rgba(255,246,233,0.62)",
    faint: "rgba(255,246,233,0.18)",
    building: "rgba(255,246,233,0.13)",
    window: "#FFC46B",
    positive: "#7EF0B6",
    negative: "#FF8E7F",
    chip: "rgba(255,246,233,0.10)",
  },
  jade: {
    label: "Jade",
    bgTop: "#062A21",
    bgBottom: "#0F4F40",
    glow: "#E9C46A",
    glowOpacity: 0.22,
    text: "#F5EFD9",
    muted: "rgba(245,239,217,0.62)",
    faint: "rgba(245,239,217,0.18)",
    building: "rgba(245,239,217,0.12)",
    window: "#E9C46A",
    positive: "#E9C46A",
    negative: "#FF9C8A",
    chip: "rgba(245,239,217,0.10)",
  },
  daylight: {
    label: "Daylight",
    bgTop: "#DCEBFF",
    bgBottom: "#FBFDFF",
    glow: "#FFFFFF",
    glowOpacity: 0.9,
    text: "#0D1F35",
    muted: "rgba(13,31,53,0.60)",
    faint: "rgba(13,31,53,0.16)",
    building: "#14304F",
    window: "#FFD166",
    positive: "#0F8A4B",
    negative: "#C2410C",
    chip: "rgba(13,31,53,0.07)",
  },
};
