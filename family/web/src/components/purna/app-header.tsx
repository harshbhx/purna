import type { ReactNode } from "react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

export function AppHeader({ children, wide = false }: { children?: ReactNode; wide?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl backdrop-saturate-150 no-print">
      <div className={`mx-auto flex min-h-16 ${wide ? "max-w-[1240px]" : "max-w-5xl"} items-center justify-between gap-3 px-4 py-2 sm:px-5`}>
        <a href="/" className="no-underline" aria-label="Purna home"><Logo deva={false} /></a>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-1 sm:gap-2">{children}<ThemeToggle /></div>
      </div>
    </header>
  );
}
