// Light/dark switch for every header. The new theme spreads from the button as a circle (lib/theme.ts).
import { Moon, Sun } from "lucide-react";
import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { applyTheme, switchWithReveal, THEME_KEY, useResolvedTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export { THEME_KEY } from "@/lib/theme";

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useResolvedTheme();
  const next: Theme = theme === "dark" ? "light" : "dark";
  function flip(e: MouseEvent<HTMLButtonElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    try { localStorage.setItem(THEME_KEY, next); } catch { /* private mode */ } // saved at once, even mid-animation
    switchWithReveal(() => applyTheme(next), r.left + r.width / 2, r.top + r.height / 2);
  }
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("theme-toggle shrink-0", className)}
      aria-label={next === "dark" ? "Switch to dark mode" : "Switch to light mode"}
      title={next === "dark" ? "Dark mode" : "Light mode"}
      onClick={flip}
    >
      <Sun aria-hidden="true" className="sun" />
      <Moon aria-hidden="true" className="moon" />
    </Button>
  );
}
