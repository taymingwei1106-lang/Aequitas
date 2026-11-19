import { getSettings } from "./services/settingsStorage";

/*
 * Applies the theme preference to <html data-theme="...">.
 * Colours themselves live in styles/variables.css.
 */

let systemQuery = null;
let systemListener = null;

function resolve(preference) {
  if (preference === "light" || preference === "dark") return preference;
  const prefersLight =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches;
  return prefersLight ? "light" : "dark";
}

export function applyTheme(preference = getSettings().theme) {
  const root = document.documentElement;
  root.dataset.theme = resolve(preference);
  root.style.colorScheme = root.dataset.theme;

  // Follow the device while "system" is selected.
  if (systemQuery && systemListener) {
    systemQuery.removeEventListener("change", systemListener);
    systemQuery = null;
    systemListener = null;
  }

  if (preference === "system" && window.matchMedia) {
    systemQuery = window.matchMedia("(prefers-color-scheme: light)");
    systemListener = () => {
      root.dataset.theme = resolve("system");
      root.style.colorScheme = root.dataset.theme;
    };
    systemQuery.addEventListener("change", systemListener);
  }
}
