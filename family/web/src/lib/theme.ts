// Light and dark. The site follows the system until the header switch is pressed; then the choice is saved on the device
// and public/theme.js applies it before the page paints. Switching spreads the new theme from the switch as a growing
// circle (View Transitions API, same document only); without the API, or with reduced motion, it switches at once.
import { useEffect, useState } from "react";

export type Theme = "light" | "dark";
export const THEME_KEY = "purna.theme";
/** How long the circle takes to cover the page. */
export const REVEAL_MS = 520;
/** Set on <html> while a switch runs; the CSS that turns off the default cross-fade is scoped to it. */
export const REVEAL_CLASS = "theme-reveal";

const systemDark = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-color-scheme: dark)").matches;

export function currentTheme(): Theme {
  const set = typeof document === "undefined" ? null : document.documentElement.getAttribute("data-theme");
  if (set === "light" || set === "dark") return set;
  return systemDark() ? "dark" : "light";
}

export function applyTheme(t: Theme): void {
  document.documentElement.setAttribute("data-theme", t);
  try { localStorage.setItem(THEME_KEY, t); } catch { /* private mode: lasts for this page */ }
}

/** The theme in use right now, kept up to date when the switch or the system setting changes it. */
export function useResolvedTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(() => (typeof document === "undefined" ? "light" : currentTheme()));
  useEffect(() => {
    const on = () => setTheme(currentTheme());
    on();
    const mo = typeof MutationObserver !== "undefined" ? new MutationObserver(on) : null;
    mo?.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = typeof matchMedia !== "undefined" ? matchMedia("(prefers-color-scheme: dark)") : null;
    mq?.addEventListener?.("change", on);
    return () => { mo?.disconnect(); mq?.removeEventListener?.("change", on); };
  }, []);
  return theme;
}

/** Radius of the smallest circle centred on (x, y) that covers a w by h viewport: the distance to the farthest corner. */
export function revealRadius(x: number, y: number, w: number, h: number): number {
  return Math.hypot(Math.max(x, w - x), Math.max(y, h - y));
}

type VT = { ready: Promise<unknown>; finished: Promise<unknown> };

/**
 * Runs `apply` (which must change the theme synchronously) inside a view transition and grows the new theme as a circle
 * from (x, y). Returns true when the circle runs, false when the change happened at once.
 */
export function switchWithReveal(change: () => void, x: number, y: number): boolean {
  let done = false;
  const apply = () => { if (!done) { done = true; change(); } };
  const doc = document as Document & { startViewTransition?: (cb: () => void) => VT };
  const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || typeof doc.startViewTransition !== "function") {
    apply();
    return false;
  }
  const root = document.documentElement;
  root.classList.add(REVEAL_CLASS);
  const r = revealRadius(x, y, innerWidth, innerHeight);
  const t = doc.startViewTransition(apply);
  // If the browser never runs the callback (a skipped transition, a hidden tab), still switch.
  setTimeout(apply, REVEAL_MS + 300);
  void t.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: REVEAL_MS, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => { /* skipped: the theme has changed anyway */ });
  const clear = () => root.classList.remove(REVEAL_CLASS);
  void t.finished.then(clear, clear);
  return true;
}
