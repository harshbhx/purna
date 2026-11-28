// /docs: safety, setup, guides, privacy and terms, written in markdown (web/src/content/docs) and rendered as React
// elements (react-markdown, no raw HTML). One page per hash: /docs#safety, /docs#setup, …
// Layout: the menu and search on the left, the page in the middle, "On this page" on the right (wide screens).
import {
  Accessibility, ArrowLeft, ArrowRight, BarChart3, BookOpen, Clock, FileText, Flag, FlaskConical, Glasses, HeartHandshake,
  Lock, Pencil, Phone, Printer, Search, ShieldAlert, Stethoscope, TriangleAlert, type LucideIcon,
} from "lucide-react";
import { Children, isValidElement, useEffect, useMemo, useState, type ReactNode } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppHeader } from "@/components/purna/app-header";
import { SiteFooter } from "@/components/purna/site-footer";
import { SkipLink } from "@/components/purna/skip-link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import overview from "@/content/docs/overview.md?raw";
import safety from "@/content/docs/safety.md?raw";
import setup from "@/content/docs/setup.md?raw";
import carers from "@/content/docs/carers.md?raw";
import therapists from "@/content/docs/therapists.md?raw";
import measures from "@/content/docs/measures.md?raw";
import privacy from "@/content/docs/privacy.md?raw";
import terms from "@/content/docs/terms.md?raw";
import accessibility from "@/content/docs/accessibility.md?raw";
import evidence from "@/content/docs/evidence.md?raw";
import report from "@/content/docs/report.md?raw";

export interface DocPage { id: string; title: string; group: string; body: string; desc: string; icon: LucideIcon }

export const DOCS: DocPage[] = [
  { id: "overview", title: "Overview", group: "Start", body: overview, icon: BookOpen, desc: "What Purna is, who it's for, and where to begin." },
  { id: "safety", title: "Safety", group: "Start", body: safety, icon: ShieldAlert, desc: "Read before the first session: who shouldn't use it, a safe space, when to stop." },
  { id: "setup", title: "Setting up the glasses", group: "Start", body: setup, icon: Glasses, desc: "Get the Lens onto Spectacles, run a session, link it to the family site." },
  { id: "carers", title: "Guide for carers", group: "Guides", body: carers, icon: HeartHandshake, desc: "Your part: set it up, sit nearby, keep it gentle, share with the therapist." },
  { id: "therapists", title: "Guide for therapists", group: "Guides", body: therapists, icon: Stethoscope, desc: "Reading the results, setting the next session, and the limits to keep in mind." },
  { id: "measures", title: "What the numbers mean", group: "Guides", body: measures, icon: BarChart3, desc: "Each result in plain words, then exactly how it's worked out." },
  { id: "privacy", title: "Privacy", group: "Policies", body: privacy, icon: Lock, desc: "What's stored, where, for how long, and your rights wherever you live." },
  { id: "terms", title: "Terms of use", group: "Policies", body: terms, icon: FileText, desc: "Plain-language terms for using Purna and Purna Family." },
  { id: "accessibility", title: "Accessibility", group: "Policies", body: accessibility, icon: Accessibility, desc: "What we check, what isn't perfect yet, and how to tell us." },
  { id: "evidence", title: "Evidence and limits", group: "About", body: evidence, icon: FlaskConical, desc: "Why it's built this way, with sources, and what we don't know yet." },
  { id: "report", title: "Report a problem", group: "About", body: report, icon: Flag, desc: "Safety concerns, bugs and security problems: how to reach us." },
];

const GROUP_STYLE: Record<string, string> = {
  Start: "bg-[color-mix(in_srgb,var(--flame)_16%,transparent)] text-warn",
  Guides: "bg-[color-mix(in_srgb,var(--right)_14%,transparent)] text-[var(--right)]",
  Policies: "bg-muted text-muted-foreground",
  About: "bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-success",
};

const SOURCE = "https://github.com/harshbhx/purna/blob/main/family/web/src/content/docs/";
const pageFromHash = (): DocPage => DOCS.find((d) => d.id === location.hash.slice(1)) ?? DOCS[0];

const text = (n: ReactNode): string =>
  Children.toArray(n).map((c) => (typeof c === "string" || typeof c === "number" ? String(c) : isValidElement<{ children?: ReactNode }>(c) ? text(c.props.children) : "")).join("");
const slug = (s: string) => "sec-" + s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const plain = (md: string) => md.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_`>#|]/g, "").replace(/\s+/g, " ").trim();

/** Splits a page into its title, its first paragraph (the lead) and the rest. */
function parts(body: string) {
  const lines = body.split("\n");
  const title = (lines.find((l) => l.startsWith("# ")) ?? "# ").slice(2).trim();
  const after = lines.slice(lines.findIndex((l) => l.startsWith("# ")) + 1);
  let i = 0;
  while (i < after.length && after[i].trim() === "") i++;
  const leadLines: string[] = [];
  if (after[i] && !after[i].startsWith(">") && !after[i].startsWith("#") && !after[i].startsWith("|")) {
    while (i < after.length && after[i].trim() !== "") leadLines.push(after[i++]);
  }
  const rest = after.slice(i).join("\n");
  const sections = rest.split("\n").filter((l) => l.startsWith("## ")).map((l) => l.slice(3).trim());
  const reviewed = /Last reviewed: ([^.]+)\./.exec(body)?.[1] ?? null;
  const minutes = Math.max(1, Math.round(plain(body).split(" ").length / 200));
  return { title, lead: leadLines.join(" "), rest, sections, reviewed, minutes };
}

const MD: Components = {
  h2: ({ children }) => <h2 id={slug(text(children))} className="doc-h2 m-0 mt-12 scroll-mt-24 text-[23px] font-semibold tracking-[-0.02em]">{children}</h2>,
  h3: ({ children }) => <h3 className="m-0 mt-7 text-[18px] font-semibold tracking-[-0.01em]">{children}</h3>,
  p: ({ children }) => <p className="m-0 mt-4 max-w-[68ch] text-[16.5px] leading-[1.72]">{children}</p>,
  ul: ({ children }) => <ul className="doc-list m-0 mt-4 flex max-w-[68ch] flex-col gap-2.5 p-0 text-[16.5px] leading-[1.65]">{children}</ul>,
  ol: ({ children }) => <ol className="m-0 mt-4 flex max-w-[68ch] list-decimal flex-col gap-2.5 pl-6 text-[16.5px] leading-[1.65] marker:font-semibold marker:text-muted-foreground">{children}</ol>,
  blockquote: ({ children }) => (
    <div className="doc-callout mt-6 flex max-w-[68ch] gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--flame)_45%,transparent)] bg-warn-bg px-5 py-4 text-warn [&_p]:mt-0 [&_p+p]:mt-2">
      <TriangleAlert className="mt-1 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  ),
  a: ({ href, children }) => <a href={href}>{children}</a>,
  code: ({ children }) => <code className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.88em]">{children}</code>,
  table: ({ children }) => (
    <div role="region" aria-label="Table, scrolls sideways on small screens" tabIndex={0} className="doc-table mt-6 max-w-full overflow-x-auto rounded-2xl border border-border bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
      <table className="w-full border-collapse text-left text-[15px]">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b border-border bg-muted/60 px-4 py-3 align-bottom text-[13.5px] font-semibold">{children}</th>,
  td: ({ children }) => <td className="border-b border-border px-4 py-3 align-top leading-relaxed">{children}</td>,
};

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  useEffect(() => {
    setActive(ids[0] ?? null);
    if (typeof IntersectionObserver === "undefined" || !ids.length) return;
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (seen[0]) setActive(seen[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [ids.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps
  return active;
}

export function Docs() {
  const [page, setPage] = useState<DocPage>(pageFromHash);
  const [q, setQ] = useState("");
  useEffect(() => {
    const on = () => { setPage(pageFromHash()); setQ(""); window.scrollTo({ top: 0, behavior: "instant" }); document.getElementById("doc-body")?.focus({ preventScroll: true }); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  useEffect(() => { document.title = `${page.title}: Purna docs`; }, [page]);

  const p = useMemo(() => parts(page.body), [page]);
  const isHome = page.id === "overview";
  // The overview's "Start here" table becomes the cards below its header.
  const rest = isHome ? p.rest.replace(/## Start here[\s\S]*?(?=\n## )/, "") : p.rest;
  const sections = isHome ? p.sections.filter((s) => s !== "Start here") : p.sections;
  const ids = useMemo(() => sections.map(slug), [sections]);
  const active = useActiveSection(ids);

  const i = DOCS.indexOf(page);
  const prev = DOCS[i - 1], next = DOCS[i + 1];
  const groups = [...new Set(DOCS.map((d) => d.group))];
  const results = q.trim().length < 2 ? [] : DOCS.filter((d) => (d.title + " " + d.desc + " " + plain(d.body)).toLowerCase().includes(q.trim().toLowerCase()));
  const Icon = page.icon;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SkipLink />
      <AppHeader wide>
        <Button variant="ghost" size="sm" asChild><a href="/" className="no-underline">Purna home</a></Button>
        <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex"><a href="/play" className="no-underline">Try the table</a></Button>
        <Button variant="outline" size="sm" aria-label="Print this page" onClick={() => window.print()}><Printer /><span className="hidden sm:inline">Print this page</span></Button>
      </AppHeader>

      <div className="doc-band no-print border-b border-border">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-4 py-3 text-[13.5px] text-muted-foreground sm:px-5">
          <span><a href="#overview" className="text-muted-foreground no-underline hover:text-foreground">Docs</a><span aria-hidden="true"> / </span>{page.group}<span aria-hidden="true"> / </span><span className="text-foreground">{page.title}</span></span>
          <span className="hidden items-center gap-1.5 sm:flex"><Phone className="size-3.5 text-danger" aria-hidden="true" />Emergency? Call your local emergency number.</span>
        </div>
      </div>

      <main id="main" tabIndex={-1} className="mx-auto grid w-full max-w-[1240px] flex-1 gap-8 px-4 py-8 outline-none sm:px-5 md:py-10 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)_210px] [&>*]:min-w-0">
        <aside className="no-print lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
          <label className="relative block">
            <span className="sr-only">Search the docs</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="doc-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search the docs"
              className="h-10 w-full rounded-xl border border-input bg-card pr-3 pl-9 text-[15px] outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          {q.trim().length >= 2 && (
            <div className="mt-3 rounded-xl border border-border bg-card p-2" aria-live="polite">
              <p className="m-0 px-2 py-1 text-[12.5px] text-muted-foreground">{results.length ? `${results.length} page${results.length > 1 ? "s" : ""} mention “${q.trim()}”` : `Nothing mentions “${q.trim()}”`}</p>
              <ul aria-label="Search results" className="m-0 list-none p-0">
                {results.map((d) => (
                  <li key={d.id}><a href={`#${d.id}`} className="block rounded-lg px-2 py-1.5 text-[14.5px] no-underline hover:bg-muted">{d.title}</a></li>
                ))}
              </ul>
            </div>
          )}

          <nav aria-label="Documentation" className="mt-5 -mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
            <div className="flex gap-5 lg:block">
              {groups.map((g) => (
                <div key={g} className="shrink-0 lg:mb-6">
                  <h2 className="m-0 mb-2 px-3 text-[12px] font-semibold tracking-[0.02em] text-muted-foreground">{g}</h2>
                  <ul className="m-0 flex list-none gap-1 p-0 lg:flex-col">
                    {DOCS.filter((d) => d.group === g).map((d) => {
                      const I = d.icon;
                      const on = d.id === page.id;
                      return (
                        <li key={d.id}>
                          <a
                            href={`#${d.id}`}
                            aria-current={on ? "page" : undefined}
                            className={cn("doc-nav flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14.5px] whitespace-nowrap no-underline", on ? "bg-foreground font-medium text-background" : "text-foreground hover:bg-muted")}
                          >
                            <I className={cn("size-4 shrink-0", on ? "opacity-100" : "text-muted-foreground")} aria-hidden="true" />{d.title}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          <div id="emergency" className="mt-2 hidden rounded-2xl border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-danger-bg p-4 text-[14px] leading-relaxed lg:block">
            <p className="m-0 flex items-center gap-2 font-semibold text-danger"><Phone className="size-4" aria-hidden />In an emergency</p>
            <p className="m-0 mt-1.5">Purna can’t detect a stroke. Sudden face drooping, arm weakness, speech or vision problems: call your local emergency number now. <a href="#safety">Signs to look for</a>.</p>
          </div>
        </aside>

        <article id="doc-body" tabIndex={-1} className="doc outline-none" aria-labelledby="doc-title">
          <header className="doc-header relative overflow-hidden rounded-3xl border border-border px-6 py-8 md:px-9 md:py-10">
            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <span className={cn("rounded-full px-2.5 py-1 font-medium", GROUP_STYLE[page.group])}>{page.group}</span>
              <span className="flex items-center gap-1 text-muted-foreground"><Clock className="size-3.5" aria-hidden="true" />{p.minutes} min read</span>
              {p.reviewed && <span className="text-muted-foreground">Reviewed {p.reviewed}</span>}
            </div>
            <div className="mt-5 flex items-start gap-4">
              <span className="doc-icon hidden size-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-card sm:flex" aria-hidden="true"><Icon className="size-6" /></span>
              <div className="min-w-0">
                <h1 id="doc-title" className="m-0 text-[34px] leading-[1.05] font-semibold tracking-[-0.035em] text-balance md:text-[44px]">{p.title}</h1>
                {p.lead && (
                  <div className="doc-lead mt-3 max-w-[62ch] text-[17.5px] leading-[1.6] text-muted-foreground [&_p]:m-0">
                    <Markdown remarkPlugins={[remarkGfm]} components={{ a: MD.a, p: ({ children }) => <p>{children}</p> }}>{p.lead}</Markdown>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div id="emergency-inline" className="mt-4 rounded-2xl border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-danger-bg px-4 py-3 text-[14px] leading-relaxed lg:hidden">
            <span className="font-semibold text-danger">In an emergency: </span>Purna can’t detect a stroke. Call your local emergency number now. <a href="#safety">Signs to look for</a>.
          </div>

          {isHome && (
            <div className="mt-10 grid gap-8">
              {groups.map((g) => (
                <section key={g} aria-labelledby={`grp-${g}`}>
                  <h2 id={`grp-${g}`} className="m-0 text-[15px] font-semibold text-muted-foreground">{g === "Start" ? "Start here" : g}</h2>
                  <ul className="m-0 mt-3 grid list-none gap-3 p-0 sm:grid-cols-2">
                    {DOCS.filter((d) => d.group === g && d.id !== "overview").map((d) => {
                      const I = d.icon;
                      return (
                        <li key={d.id}>
                          <a href={`#${d.id}`} className="doc-card group flex h-full gap-3.5 rounded-2xl border border-border bg-card p-4 no-underline transition-colors hover:border-foreground/30">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground" aria-hidden="true"><I className="size-5" /></span>
                            <span className="min-w-0">
                              <span className="block text-[15.5px] font-semibold text-foreground">{d.title}</span>
                              <span className="mt-1 block text-[14px] leading-snug text-muted-foreground">{d.desc}</span>
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
              <a href="/play" className="doc-play flex items-center justify-between gap-4 rounded-2xl bg-night p-5 text-night-foreground no-underline">
                <span><span className="block text-[16px] font-semibold">Curious how it feels?</span><span className="mt-1 block text-[14px] text-night-muted">Try the table in your browser, on the same engine as the glasses.</span></span>
                <ArrowRight className="size-5 shrink-0" aria-hidden="true" />
              </a>
            </div>
          )}

          <div className="doc-body">
            <Markdown remarkPlugins={[remarkGfm]} components={{ ...MD, h1: () => null }}>
              {rest}
            </Markdown>
          </div>

          <div className="no-print mt-12 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-5 py-4 text-[14px]">
            <span className="text-muted-foreground">Something unclear or wrong on this page? <a href="mailto:harshbhx@gmail.com">Tell us</a>.</span>
            <a href={`${SOURCE}${page.id}.md`} className="inline-flex items-center gap-1.5 no-underline"><Pencil className="size-3.5" aria-hidden="true" />Suggest an edit on GitHub</a>
          </div>

          <nav aria-label="Previous and next page" className="no-print mt-6 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <a href={`#${prev.id}`} className="doc-card flex flex-col gap-1 rounded-2xl border border-border p-4 no-underline hover:border-foreground/30">
                <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground"><ArrowLeft className="size-3.5" aria-hidden />Previous</span>
                <span className="text-[15.5px] font-semibold text-foreground">{prev.title}</span>
              </a>
            ) : <span className="hidden sm:block" />}
            {next ? (
              <a href={`#${next.id}`} className="doc-card flex flex-col items-end gap-1 rounded-2xl border border-border p-4 text-right no-underline hover:border-foreground/30">
                <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">Next<ArrowRight className="size-3.5" aria-hidden /></span>
                <span className="text-[15.5px] font-semibold text-foreground">{next.title}</span>
              </a>
            ) : <span className="hidden sm:block" />}
          </nav>
        </article>

        {sections.length > 1 && (
          <aside className="no-print hidden xl:sticky xl:top-24 xl:block xl:self-start">
            <nav aria-label="On this page">
              <h2 className="m-0 mb-2 text-[12px] font-semibold tracking-[0.02em] text-muted-foreground">On this page</h2>
              <ul className="m-0 list-none border-l border-border p-0">
                {sections.map((s) => {
                  const id = slug(s);
                  const on = active === id;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        aria-current={on ? "location" : undefined}
                        onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                        className={cn("-ml-px block w-full border-l-2 py-1.5 pr-1 pl-3 text-left text-[13.5px] leading-snug", on ? "border-flame font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
                      >
                        {s}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
