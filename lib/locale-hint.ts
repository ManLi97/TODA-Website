// Remembered language choice for the one-time locale hint (components/
// locale-hint.tsx). Stored in localStorage, never a cookie — the site stays
// cookie-free and the server never sees it (no redirects, no cloaking).
// Values: "chosen:<locale>" (user picked a language — via the hint or the
// header switcher) or "dismissed". Any value silences the hint for good.
const KEY = "toda.locale-hint";

export function readLocaleHint(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function writeLocaleHint(value: `chosen:${string}` | "dismissed"): void {
  try {
    window.localStorage.setItem(KEY, value);
  } catch {
    // Storage blocked (private mode, disabled) — the hint simply shows again next time.
  }
}
