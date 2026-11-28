// Finds glossary words in running text and wraps the first use of each on a page in <Term>, so hard or medical words
// explain themselves. Only plain text inside paragraphs, list items and table cells is touched; links and headings aren't.
import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { Term } from "@/components/purna/term";
import { GLOSSARY } from "@/data/glossary";

/** Everyday words that are in the glossary but don't need a card every time they appear. */
const QUIET = new Set(["beam", "bell", "hint", "replay", "lens", "delete-everything", "revisit", "crossings", "practice-not-treatment"]);

const ENTRIES = GLOSSARY.filter((t) => !QUIET.has(t.slug))
  .flatMap((t) => t.aliases.map((a) => ({ alias: a, slug: t.slug })))
  .sort((a, b) => b.alias.length - a.alias.length);
const BY_ALIAS = new Map(ENTRIES.map((e) => [e.alias.toLowerCase(), e.slug]));
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const PATTERN = new RegExp(`(?<![\\w-])(${ENTRIES.map((e) => esc(e.alias)).join("|")})(?![\\w-])`, "gi");

/** Returns a function that links glossary words; `seen` keeps it to the first use of each term on the page. */
export function termLinker(seen: Set<string>, skip?: string) {
  const linkText = (text: string, key: string): ReactNode[] => {
    const out: ReactNode[] = [];
    let last = 0;
    PATTERN.lastIndex = 0;
    for (let m = PATTERN.exec(text); m; m = PATTERN.exec(text)) {
      const slug = BY_ALIAS.get(m[1].toLowerCase());
      if (!slug || seen.has(slug) || slug === skip) continue;
      seen.add(slug);
      out.push(text.slice(last, m.index), <Term key={`${key}-${m.index}`} slug={slug}>{m[1]}</Term>);
      last = m.index + m[1].length;
    }
    out.push(text.slice(last));
    return out;
  };
  const walk = (node: ReactNode, key: string): ReactNode => {
    if (typeof node === "string") return linkText(node, key);
    if (Array.isArray(node)) return node.map((n, i) => walk(n, `${key}.${i}`));
    if (isValidElement<{ children?: ReactNode; href?: string }>(node)) {
      const el = node as ReactElement<{ children?: ReactNode; href?: string }>;
      // Never inside links or code; emphasis and bold are fine.
      if (el.type === "a" || el.type === "code" || typeof el.props.href === "string") return el;
      if (el.props.children === undefined) return el;
      return cloneElement(el, undefined, Children.map(el.props.children, (c, i) => walk(c, `${key}.${i}`)));
    }
    return node;
  };
  return (children: ReactNode) => walk(children, "t");
}
