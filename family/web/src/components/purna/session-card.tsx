import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fmtWhen } from "@/lib/format";
import { presetName, summaryOf, useLang, useT } from "@/lib/i18n";
import type { SessionCard as Card } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SideBars } from "./side-bars";

export function SessionStatus({ c }: { c: Card }) {
  const t = useT();
  if (c.leftHits === c.leftTotal && c.rightHits === c.rightTotal) return <Badge variant="success">{t.wholeTable}</Badge>;
  if (c.hints > 0) return <Badge variant="warn">{t.hints(c.hints)}</Badge>;
  return <Badge>{c.leftHits}/{c.leftTotal} {t.left.toLowerCase()}</Badge>;
}

export function SessionCard({ c, onOpen, big = false, className }: { c: Card; onOpen?: () => void; big?: boolean; className?: string }) {
  const lang = useLang();
  const t = useT();
  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="when text-[13px] text-muted-foreground">{fmtWhen(c.startedAt, lang)}, {presetName(c.preset, lang)}</span>
        <SessionStatus c={c} />
      </div>
      <p className={cn("line m-0 leading-snug text-foreground", big ? "text-[17px]" : "text-[15px]")}>{summaryOf(c, lang)}</p>
      <SideBars {...c} />
    </>
  );
  if (!onOpen) return <div className={cn("session-card flex flex-col gap-3 rounded-2xl border border-border bg-card p-4", className)}>{body}</div>;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn("session-card group relative flex w-full flex-col gap-3 rounded-2xl border border-border bg-card p-4 pr-10 text-left shadow-[0_1px_2px_rgba(23,20,15,0.04)] transition-[border,box-shadow,transform] hover:border-foreground/20 hover:shadow-[0_12px_28px_-18px_rgba(23,20,15,0.35)] active:translate-y-px", className)}
    >
      <span className="sr-only">{t.openSession} </span>
      {body}
      <ChevronRight aria-hidden="true" className="absolute top-1/2 right-3 size-[18px] -translate-y-1/2 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
