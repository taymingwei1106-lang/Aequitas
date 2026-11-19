/*
 * Installable-app support.
 * - Registers the service worker (production builds only).
 * - Asks the browser to keep this site's storage persistent, so local data
 *   is less likely to be cleared when the device is low on space.
 */
let deferredInstallPrompt = null;
const listeners = new Set();

/* Android / desktop Chrome: the browser's own install prompt, if offered. */
export function canPromptInstall() {
  return Boolean(deferredInstallPrompt);
}

export function onInstallAvailabilityChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function promptInstall() {
  if (!deferredInstallPrompt) return false;
  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice.catch(() => null);
  deferredInstallPrompt = null;
  listeners.forEach((fn) => fn(false));
  return choice?.outcome === "accepted";
}

export function setupPwa() {
  if (typeof window === "undefined") return;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    listeners.forEach((fn) => fn(true));
  });

  if (import.meta.env.PROD && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.warn("Aequitas: offline support unavailable.", error);
      });
    });
  }

  if (navigator.storage?.persist) {
    navigator.storage.persisted?.().then((persisted) => {
      if (!persisted) navigator.storage.persist().catch(() => {});
    });
  }
}

/* True when running as the installed app rather than in a browser tab. */
export function isInstalledApp() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}
