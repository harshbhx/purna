// /docs: safety, setup, guides, privacy and terms, written in markdown (web/src/content/docs) and rendered as React
// elements (react-markdown, no raw HTML). One page per hash: /docs#safety, /docs#setup, …
// Layout: the menu and search on the left, the page in the middle, "On this page" on the right (wide screens).
import {
  Accessibility, ArrowLeft, ArrowRight, BarChart3, BookOpen, Clock, FileText, Flag, FlaskConical, Glasses, HeartHandshake,
  BookA, Boxes, Check, ClipboardCheck, Gavel, Link2, Lock, Pencil, Phone, Search, ShieldAlert, Stethoscope, TriangleAlert, type LucideIcon,
} from "lucide-react";
import { Children, isValidElement, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppHeader } from "@/components/purna/app-header";
import { SiteFooter } from "@/components/purna/site-footer";
import { SkipLink } from "@/components/purna/skip-link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { termLinker } from "@/lib/terms";
import { GLOSSARY } from "@/data/glossary";
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
import results from "@/content/docs/results.md?raw";
import glossary from "@/content/docs/glossary.md?raw";
import judges from "@/content/docs/judges.md?raw";
import architecture from "@/content/docs/architecture.md?raw";

export interface DocPage { id: string; title: string; group: string; body: string; desc: string; icon: LucideIcon; summary?: string[]; related?: string[] }

export const DOCS: DocPage[] = [
  { id: "overview", title: "Overview", group: "Start", body: overview, icon: BookOpen, desc: "What Purna is, who it's for, and where to begin.", related: ["judges", "safety", "results"] },
  { id: "judges", title: "For judges", group: "Start", body: judges, icon: Gavel, desc: "Purna in one minute, a five-minute tour, every criterion, the numbers, honest status.",
    summary: ["Try the 3D table at /play first, with headphones", "Every criterion mapped to evidence", "Simulated players, not patients: all numbers say so"], related: ["results", "architecture", "evidence"] },
  { id: "safety", title: "Safety", group: "Start", body: safety, icon: ShieldAlert, desc: "Read before the first session: who shouldn't use it, a safe space, when to stop.",
    summary: ["Purna can't detect a stroke: know the warning signs and call your local emergency number", "Ask a doctor first about seizures, serious conditions or implants; adults only", "Sit down, with someone nearby; stop at dizziness, headache or any new symptom"], related: ["setup", "carers", "report"] },
  { id: "setup", title: "Setting up the glasses", group: "Start", body: setup, icon: Glasses, desc: "Get the Lens onto Spectacles, run a session, link it to the family site.",
    summary: ["Send the Lens from Lens Studio to your Spectacles", "A session takes about four minutes, seated at a table", "Sharing is off until you turn it on; the first send shows a DIYA code"], related: ["safety", "carers", "measures"] },
  { id: "carers", title: "Guide for carers", group: "Guides", body: carers, icon: HeartHandshake, desc: "Your part: set it up, sit nearby, keep it gentle, share with the therapist.",
    summary: ["You set it up and stay nearby; the therapist plans the practice", "Encourage, don't point: the searching is the exercise", "Look at weeks, not single days; share a doctor link when the therapist asks"], related: ["safety", "therapists", "privacy"] },
  { id: "therapists", title: "Guide for therapists", group: "Guides", body: therapists, icon: Stethoscope, desc: "Reading the results, setting the next session, limits, and how to pilot it with us.",
    summary: ["A 7-day read-only link shows every session and measure; you can set the next session", "Published cut-offs don't carry over: watch change over time", "Not yet used with patients: we'd value your review or a small pilot"], related: ["measures", "results", "evidence"] },
  { id: "measures", title: "What the numbers mean", group: "Reference", body: measures, icon: BarChart3, desc: "Each result in plain words, then exactly how it's worked out.",
    summary: ["Four results on the report: left vs right, chipped diyas, search order, head turn", "Plus the attention map: where the head pointed on the table", "Definitions and formulas for therapists"], related: ["results", "glossary", "therapists"] },
  { id: "results", title: "Results so far", group: "Reference", body: results, icon: ClipboardCheck, desc: "What we tested and the numbers: the patient bench, 286 tests, accessibility.",
    summary: ["The measures separate three simulated search styles on 200 layouts each", "286 automated tests run on every change", "Nothing yet from patients or real glasses"], related: ["evidence", "measures", "architecture"] },
  { id: "evidence", title: "Evidence and limits", group: "Reference", body: evidence, icon: FlaskConical, desc: "The research behind every design choice, with sources, and what isn't known.",
    summary: ["Every design choice traces to a published finding, linked here", "Whether neglect training helps daily life is uncertain, so Purna claims nothing", "Next: clinician review, then an ethics-approved pilot"], related: ["results", "glossary", "judges"] },
  { id: "architecture", title: "How it's built", group: "Reference", body: architecture, icon: Boxes, desc: "One engine in three places, the data contract, the server, security, tests and releases.",
    summary: ["One TypeScript engine runs on the glasses, in the tests and in the browser", "Every session is one checked, versioned JSON document", "286 tests gate every change; Cloudflare deploys from main"], related: ["results", "privacy", "judges"] },
  { id: "glossary", title: "Glossary", group: "Reference", body: glossary, icon: BookA, desc: "Every term used here, from allocentric neglect to WCAG, in plain words.", related: ["measures", "evidence"] },
  { id: "privacy", title: "Privacy", group: "Policies", body: privacy, icon: Lock, desc: "What's stored, where, for how long, and your rights wherever you live.",
    summary: ["No names, faces, camera images or location from the glasses", "Keys stored only as hashes; doctor links expire; unpaired data deleted after 30 days", "Delete everything removes it all, any time"], related: ["terms", "architecture", "report"] },
  { id: "terms", title: "Terms of use", group: "Policies", body: terms, icon: FileText, desc: "Plain-language terms for using Purna and Purna Family.", related: ["privacy", "safety"] },
  { id: "accessibility", title: "Accessibility", group: "Policies", body: accessibility, icon: Accessibility, desc: "What we check, what isn't perfect yet, and how to tell us.", related: ["results", "report"] },
  { id: "report", title: "Report a problem", group: "Help", body: report, icon: Flag, desc: "Safety concerns, bugs and security problems: how to reach us.", related: ["safety", "privacy"] },
];

const GROUP_STYLE: Record<string, string> = {
  Start: "bg-[color-mix(in_srgb,var(--flame)_16%,transparent)] text-warn",
  Guides: "bg-[color-mix(in_srgb,var(--right)_14%,transparent)] text-[var(--right)]",
  Policies: "bg-muted text-muted-foreground",
  Reference: "bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-success",
  Help: "bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-danger",
};

const SOURCE = "https://github.com/harshbhx/purna/blob/main/family/web/src/content/docs/";
const pageFromHash = (): DocPage => DOCS.find((d) => d.id === location.hash.slice(1).split("/")[0]) ?? DOCS[0];
/** "/docs#glossary/hemianopia" points at one glossary entry. */
const termFromHash = () => (location.hash.startsWith("#glossary/") ? location.hash.slice("#glossary/".length) : null);

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

function mdWith(link: (c: ReactNode) => ReactNode): Components {
  return {
  ...MD,
  p: ({ children }) => <p className="m-0 mt-4 max-w-[68ch] text-[16.5px] leading-[1.72]">{link(children)}</p>,
  li: ({ children }) => <li>{link(children)}</li>,
  td: ({ children }) => <td className="border-b border-border px-4 py-3 align-top leading-relaxed">{link(children)}</td>,
  };
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
  img: ({ src, alt }) => <img src={src} alt={alt ?? ""} loading="lazy" className="mt-6 block h-auto w-full rounded-2xl border border-border bg-card" />,
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
  const [copied, setCopied] = useState(false);
  async function copyLink() {
    const url = `${location.origin}/docs#${page.id}`;
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* no clipboard: the address bar has it */ }
  }
  useEffect(() => {
    const on = () => {
      setPage(pageFromHash());
      setQ("");
      const t = termFromHash();
      if (t) { requestAnimationFrame(() => { const el = document.getElementById(`term-${t}`); el?.scrollIntoView({ block: "center" }); el?.focus({ preventScroll: true }); }); return; }
      window.scrollTo({ top: 0, behavior: "instant" });
      document.getElementById("doc-body")?.focus({ preventScroll: true });
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  useEffect(() => { document.title = `${page.title}: Purna docs`; }, [page]);
  useEffect(() => {
    const t = termFromHash();
    if (t) requestAnimationFrame(() => document.getElementById(`term-${t}`)?.scrollIntoView({ block: "center" }));
  }, []);

  const p = useMemo(() => parts(page.body), [page]);
  const isHome = page.id === "overview";
  // The overview's "Start here" table becomes the cards below its header.
  const rest = isHome ? p.rest.replace(/## Start here[\s\S]*?(?=\n## )/, "") : p.rest;
  const isGlossary = page.id === "glossary";
  const letters = useMemo(() => [...new Set(GLOSSARY.map((t) => t.name[0].toUpperCase()))].sort(), []);
  const sections = isHome ? p.sections.filter((s) => s !== "Start here") : isGlossary ? letters : p.sections;
  // One set of seen terms for the whole page, emptied at every render so each term is explained at its first use.
  const seen = useRef(new Set<string>()).current;
  seen.clear();
  const components = useMemo(() => mdWith(termLinker(seen)), [seen]);
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
        <Button variant="outline" size="sm" asChild className="hidden md:inline-flex"><a href="#judges" className="no-underline">For judges</a></Button>
      </AppHeader>

      <div className="doc-band no-print border-b border-border">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-6 gap-y-1.5 px-4 py-2.5 text-[13px] text-muted-foreground sm:px-5">
          <span><a href="#overview" className="text-muted-foreground no-underline hover:text-foreground">Docs</a><span aria-hidden="true"> / </span>{page.group}<span aria-hidden="true"> / </span><span className="text-foreground">{page.title}</span></span>
          <span id="emergency" className="flex items-center gap-1.5"><Phone className="size-3.5 shrink-0 text-danger" aria-hidden="true" /><span>Purna can’t detect a stroke. Sudden face drooping, arm weakness, speech or vision problems: call your local emergency number now. <a href="#safety">Signs to look for</a>.</span></span>
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
            <div className="no-print mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-4 text-[13.5px]">
              <Button type="button" variant="outline" size="sm" onClick={copyLink}>{copied ? <Check /> : <Link2 />}{copied ? "Link copied" : "Copy link"}</Button>
              <Button variant="ghost" size="sm" asChild><a href={`${SOURCE}${page.id}.md`} className="no-underline"><Pencil />Edit on GitHub</a></Button>
              <Button variant="ghost" size="sm" asChild><a href={`mailto:harshbhx@gmail.com?subject=${encodeURIComponent(`Purna docs: ${page.title}`)}`} className="no-underline">Ask a question</a></Button>
              <span role="status" className="sr-only">{copied ? "Link copied" : ""}</span>
            </div>
          </header>

          {page.summary && (
            <section aria-labelledby="in-short" className="doc-short mt-6 rounded-2xl border border-border bg-surface px-5 py-4">
              <h2 id="in-short" className="m-0 text-[13px] font-semibold tracking-[0.02em] text-muted-foreground">In short</h2>
              <ul className="m-0 mt-2 grid list-none gap-1.5 p-0 text-[15.5px] leading-snug">
                {page.summary.map((t) => <li key={t} className="flex gap-2.5"><Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />{t}</li>)}
              </ul>
            </section>
          )}



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
            <Markdown remarkPlugins={[remarkGfm]} components={{ ...(isGlossary ? MD : components), h1: () => null }}>
              {rest}
            </Markdown>
            {isGlossary && letters.map((L) => (
              <section key={L} aria-labelledby={slug(L)}>
                <h2 id={slug(L)} className="doc-h2 m-0 mt-10 scroll-mt-24 text-[15px] font-semibold tracking-[0.02em] text-muted-foreground">{L}</h2>
                <dl className="m-0 mt-3 grid gap-2.5">
                  {GLOSSARY.filter((t) => t.name[0].toUpperCase() === L).map((t) => (
                    <div key={t.slug} id={`term-${t.slug}`} tabIndex={-1} className="glossary-term scroll-mt-28 rounded-2xl border border-border bg-card px-4 py-3.5 outline-none">
                      <dt className="text-[16px] font-semibold">{t.name}</dt>
                      <dd className="m-0 mt-1 text-[15.5px] leading-relaxed text-muted-foreground [&_p]:m-0"><Markdown components={{ a: MD.a, p: ({ children }) => <p>{children}</p> }}>{t.short}</Markdown></dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>

          {page.related && page.related.length > 0 && (
            <section aria-labelledby="related-h" className="no-print mt-12">
              <h2 id="related-h" className="m-0 text-[15px] font-semibold text-muted-foreground">Read next</h2>
              <ul className="m-0 mt-3 grid list-none gap-3 p-0 sm:grid-cols-3">
                {page.related.map((id) => DOCS.find((d) => d.id === id)).filter((d): d is DocPage => !!d).map((d) => {
                  const I = d.icon;
                  return (
                    <li key={d.id}>
                      <a href={`#${d.id}`} className="doc-card flex h-full flex-col gap-1.5 rounded-2xl border border-border bg-card p-4 no-underline hover:border-foreground/30">
                        <I className="size-4.5 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[15px] font-semibold text-foreground">{d.title}</span>
                        <span className="text-[13.5px] leading-snug text-muted-foreground">{d.desc}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <div className="no-print mt-12 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-5 py-4 text-[14px]">
            <span className="text-muted-foreground">Something unclear or wrong on this page? <a href={`mailto:harshbhx@gmail.com?subject=${encodeURIComponent(`Purna docs: ${page.title}`)}`}>Tell us</a>, or suggest an edit on GitHub.</span>
            <a href="#report" className="no-underline">Report a problem</a>
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
