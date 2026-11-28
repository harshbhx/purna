// /docs: safety, setup, guides, privacy and terms, written in markdown (web/src/content/docs) and rendered as React
// elements (react-markdown, no raw HTML). One page per hash: /docs#safety, /docs#setup, …
import { ArrowLeft, ArrowRight, Phone, Printer } from "lucide-react";
import { Children, isValidElement, useEffect, useState, type ReactNode } from "react";
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

export interface DocPage { id: string; title: string; group: string; body: string }

export const DOCS: DocPage[] = [
  { id: "overview", title: "Overview", group: "Start", body: overview },
  { id: "safety", title: "Safety", group: "Start", body: safety },
  { id: "setup", title: "Setting up the glasses", group: "Start", body: setup },
  { id: "carers", title: "Guide for carers", group: "Guides", body: carers },
  { id: "therapists", title: "Guide for therapists", group: "Guides", body: therapists },
  { id: "measures", title: "What the numbers mean", group: "Guides", body: measures },
  { id: "privacy", title: "Privacy", group: "Policies", body: privacy },
  { id: "terms", title: "Terms of use", group: "Policies", body: terms },
  { id: "accessibility", title: "Accessibility", group: "Policies", body: accessibility },
  { id: "evidence", title: "Evidence and limits", group: "About", body: evidence },
  { id: "report", title: "Report a problem", group: "About", body: report },
];

const pageFromHash = (): DocPage => DOCS.find((d) => d.id === location.hash.slice(1)) ?? DOCS[0];

const text = (n: ReactNode): string =>
  Children.toArray(n).map((c) => (typeof c === "string" || typeof c === "number" ? String(c) : isValidElement<{ children?: ReactNode }>(c) ? text(c.props.children) : "")).join("");

const MD: Components = {
  h1: ({ children }) => <h1 className="m-0 text-[32px] font-semibold tracking-[-0.03em] text-balance md:text-[40px]">{children}</h1>,
  h2: ({ children }) => <h2 className="m-0 mt-10 text-[22px] font-semibold tracking-[-0.02em]">{children}</h2>,
  h3: ({ children }) => <h3 className="m-0 mt-6 text-[18px] font-semibold">{children}</h3>,
  p: ({ children }) => <p className="m-0 mt-4 max-w-[70ch] text-[16px] leading-[1.7]">{children}</p>,
  ul: ({ children }) => <ul className="m-0 mt-4 flex max-w-[70ch] list-disc flex-col gap-2 pl-6 text-[16px] leading-[1.65]">{children}</ul>,
  ol: ({ children }) => <ol className="m-0 mt-4 flex max-w-[70ch] list-decimal flex-col gap-2 pl-6 text-[16px] leading-[1.65]">{children}</ol>,
  blockquote: ({ children }) => <div className="doc-callout mt-6 max-w-[70ch] rounded-2xl border border-flame/40 bg-warn-bg px-5 py-1 text-warn [&_p]:mt-3 [&_p:last-child]:mb-3">{children}</div>,
  a: ({ href, children }) => <a href={href}>{children}</a>,
  code: ({ children }) => <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">{children}</code>,
  table: ({ children }) => {
    const caption = "Table, scrolls sideways on small screens";
    return (
      <div role="region" aria-label={caption} tabIndex={0} className="mt-5 max-w-full overflow-x-auto rounded-xl border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        <table className="w-full border-collapse text-left text-[15px]">{children}</table>
      </div>
    );
  },
  th: ({ children }) => <th className="border-b border-border bg-surface px-4 py-2.5 align-bottom text-[14px] font-semibold">{children}</th>,
  td: ({ children }) => <td className="border-b border-border px-4 py-2.5 align-top leading-relaxed">{children}</td>,
};

export function Docs() {
  const [page, setPage] = useState<DocPage>(pageFromHash);
  useEffect(() => {
    const on = () => { setPage(pageFromHash()); window.scrollTo({ top: 0, behavior: "instant" }); document.getElementById("doc-body")?.focus({ preventScroll: true }); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  useEffect(() => { document.title = `${page.title}: Purna docs`; }, [page]);

  const i = DOCS.indexOf(page);
  const prev = DOCS[i - 1], next = DOCS[i + 1];
  const groups = [...new Set(DOCS.map((d) => d.group))];

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SkipLink />
      <AppHeader>
        <Button variant="ghost" size="sm" asChild><a href="/" className="no-underline">Purna home</a></Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}><Printer />Print this page</Button>
      </AppHeader>
      <main id="main" tabIndex={-1} className="outline-none mx-auto grid w-full max-w-6xl flex-1 gap-8 px-4 py-8 sm:px-5 md:py-12 lg:grid-cols-[240px_1fr] [&>*]:min-w-0">
        <aside className="no-print lg:sticky lg:top-24 lg:self-start">
          <nav aria-label="Documentation">
            {groups.map((g) => (
              <div key={g} className="mb-5">
                <h2 className="m-0 mb-1.5 text-[13px] font-semibold text-muted-foreground">{g}</h2>
                <ul className="m-0 flex list-none flex-wrap gap-1 p-0 lg:flex-col">
                  {DOCS.filter((d) => d.group === g).map((d) => (
                    <li key={d.id}>
                      <a href={`#${d.id}`} aria-current={d.id === page.id ? "page" : undefined}
                        className={cn("block rounded-lg px-3 py-1.5 text-[15px] no-underline", d.id === page.id ? "bg-foreground text-background" : "text-foreground hover:bg-muted")}>
                        {d.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          <div id="emergency" className="rounded-2xl border border-border bg-card p-4 text-[14px] leading-relaxed">
            <p className="m-0 flex items-center gap-2 font-semibold"><Phone className="size-4" aria-hidden />In an emergency</p>
            <p className="m-0 mt-1.5 text-muted-foreground">Purna can’t detect a stroke. Sudden face drooping, arm weakness, speech or vision problems: call your local emergency number now. <a href="#safety">Signs to look for</a>.</p>
          </div>
        </aside>

        <article id="doc-body" tabIndex={-1} className="doc outline-none" aria-labelledby="doc-title">
          <Markdown remarkPlugins={[remarkGfm]} components={{ ...MD, h1: ({ children }) => <h1 id="doc-title" className="m-0 text-[32px] font-semibold tracking-[-0.03em] text-balance md:text-[40px]">{text(children)}</h1> }}>
            {page.body}
          </Markdown>
          <nav aria-label="Previous and next page" className="no-print mt-14 flex flex-wrap justify-between gap-3 border-t border-border pt-6">
            {prev ? <a href={`#${prev.id}`} className="inline-flex items-center gap-2 text-[15px] no-underline"><ArrowLeft className="size-4" aria-hidden />{prev.title}</a> : <span />}
            {next ? <a href={`#${next.id}`} className="inline-flex items-center gap-2 text-[15px] no-underline">{next.title}<ArrowRight className="size-4" aria-hidden /></a> : <span />}
          </nav>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
