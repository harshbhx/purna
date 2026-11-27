import { Logo } from "./logo";

const COLS: { title: string; links: { label: string; href: string }[] }[] = [
  { title: "Purna", links: [{ label: "How it works", href: "/#how" }, { label: "For families", href: "/#families" }, { label: "For therapists", href: "/#therapists" }, { label: "I have a code", href: "/#code" }] },
  { title: "Project", links: [{ label: "Research behind it", href: "https://github.com/harshbhx/purna/blob/main/docs/10-RESEARCH.md" }, { label: "Source on GitHub", href: "https://github.com/harshbhx/purna" }, { label: "Design brief", href: "https://github.com/harshbhx/purna/blob/main/devpost/design-brief.md" }, { label: "Security", href: "https://github.com/harshbhx/purna/blob/main/SECURITY.md" }] },
  { title: "Built with", links: [{ label: "Snap SPECS and Lens Studio", href: "https://developers.specs.com/" }, { label: "Cloudflare Workers and D1", href: "https://developers.cloudflare.com/workers/" }, { label: "shadcn/ui and React Bits", href: "https://github.com/harshbhx/purna/blob/main/family/THIRD_PARTY.md" }] },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="m-0 max-w-xs text-[15px] leading-relaxed text-muted-foreground">Practice for people who miss the left side after a stroke, at their own dining table.</p>
          <p className="m-0 max-w-xs text-[13px] leading-relaxed text-muted-foreground">Purna is a practice tool, not a medical device. It doesn’t diagnose or treat. Talk to your therapist.</p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h2 className="m-0 text-[13px] font-semibold text-foreground">{c.title}</h2>
            <ul className="m-0 mt-4 flex list-none flex-col gap-2.5 p-0">
              {c.links.map((l) => (
                <li key={l.label}><a href={l.href} className="text-[15px] text-muted-foreground no-underline transition-colors hover:text-foreground">{l.label}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-[13px] text-muted-foreground">
          <span>© 2026 Harsh Bhanushali. MIT licence.</span>
          <span>No ads and no tracking. Built for Learn AR with SPECS.</span>
        </div>
      </div>
    </footer>
  );
}
