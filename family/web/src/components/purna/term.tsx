// An explained word: <Term slug="hemianopia">hemianopia</Term>. It is a real link to its glossary entry (so it works without
// JavaScript), with a dotted underline. Pointing at it, focusing it with the keyboard, or tapping it once shows a small card
// with the meaning; a second tap follows the link. The card is drawn in a portal with position: fixed, so nothing around the
// word can clip it, and the meaning is also in a hidden span the link points to with aria-describedby.
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { termBySlug } from "@/data/glossary";

const plain = (s: string) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_`]/g, "");

export function Term({ slug, children }: { slug: string; children: ReactNode }) {
  const term = termBySlug(slug);
  const id = "term-desc-" + useId().replace(/:/g, "");
  const ref = useRef<HTMLAnchorElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number; above: boolean } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const touched = useRef(false);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const w = Math.min(320, window.innerWidth - 16);
      const left = Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2));
      const above = r.bottom + 170 > window.innerHeight && r.top > 190;
      setPos({ left, top: above ? r.top - 8 : r.bottom + 8, above });
    };
    place();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("scroll", place, true); window.removeEventListener("resize", place); window.removeEventListener("keydown", onKey); };
  }, [open]);

  if (!term) return <>{children}</>;
  const show = (delay: number) => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setOpen(true), delay); };
  const hide = () => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setOpen(false), 120); };

  return (
    <>
      <a
        ref={ref}
        href={`/docs#glossary/${term.slug}`}
        className="term"
        aria-describedby={id}
        onMouseEnter={() => show(220)}
        onMouseLeave={hide}
        onFocus={() => show(0)}
        onBlur={hide}
        onTouchStart={() => { touched.current = true; }}
        onClick={(e) => {
          if (touched.current && !open) { e.preventDefault(); setOpen(true); }
          touched.current = false;
        }}
      >
        {children}
      </a>
      <span id={id} hidden>{plain(term.short)}</span>
      {open && pos && createPortal(
        <span
          role="tooltip"
          className="term-card"
          data-above={pos.above || undefined}
          style={{ left: pos.left, top: pos.top }}
          onMouseEnter={() => window.clearTimeout(timer.current)}
          onMouseLeave={hide}
        >
          <span className="term-card-name">{term.name}</span>
          <span className="term-card-def">{plain(term.short)}</span>
          <a className="term-card-more" href={`/docs#glossary/${term.slug}`} tabIndex={-1}>In the glossary</a>
        </span>,
        document.body,
      )}
    </>
  );
}
