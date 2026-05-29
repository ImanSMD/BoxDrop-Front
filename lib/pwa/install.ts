/**
 * App-wide capture of the PWA install prompt.
 *
 * Chrome/Android fires `beforeinstallprompt` early in the page lifecycle —
 * usually before the user has logged in and the <InstallBanner /> has mounted.
 * If we only listen from inside that component, the event has already fired and
 * is lost, so the banner never appears on Android. We register the listener at
 * module-evaluation time (imported eagerly from Providers) and stash the event
 * so the banner can read it whenever it mounts.
 *
 * iOS Safari never fires this event — the banner falls back to manual
 * "Add to Home Screen" instructions there.
 */

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((cb) => cb());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    // Prevent Chrome's default mini-infobar; we drive our own banner.
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });

  window.addEventListener("appinstalled", () => {
    installed = true;
    deferredPrompt = null;
    notify();
  });
}

export function getInstallPrompt(): BeforeInstallPromptEvent | null {
  return deferredPrompt;
}

export function clearInstallPrompt() {
  deferredPrompt = null;
  notify();
}

export function isAppInstalled(): boolean {
  if (installed) return true;
  if (typeof window === "undefined") return false;
  const standalone = window.matchMedia?.("(display-mode: standalone)").matches;
  // iOS Safari exposes navigator.standalone when launched from the home screen.
  const iosStandalone = (
    window.navigator as Navigator & { standalone?: boolean }
  ).standalone;
  return Boolean(standalone || iosStandalone);
}

export function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const iOSDevice = /iphone|ipad|ipod/i.test(ua);
  // iPadOS 13+ reports as Mac; detect via touch points.
  const iPadOS =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadOS;
}

/** Subscribe to prompt availability / install changes. Returns an unsubscribe. */
export function subscribeInstall(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
