// First stop for keyboard users: jumps past the header to the page's <main id="main">.
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only rounded-lg bg-foreground px-4 py-2.5 text-[15px] font-medium text-background no-underline focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:outline-none focus:ring-2 focus:ring-ring"
    >
      Skip to content
    </a>
  );
}
