import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fmtWhen, titleCase } from "@/lib/format";
import type { SessionCard as Card } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SideBars } from "./side-bars";

export function SessionStatus({ c }: { c: Card }) {
  if (c.leftHits === c.leftTotal && c.rightHits === c.rightTotal) return <Badge variant="success">Whole table</Badge>;
  if (c.hints > 0) return <Badge variant="warn">{c.hints} hint{c.hints === 1 ? "" : "s"}</Badge>;
  return <Badge>{c.leftHits}/{c.leftTotal} left</Badge>;
}

export function SessionCard({ c, onOpen, big = false, className }: { c: Card; onOpen?: () => void; big?: boolean; className?: string }) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="when text-[13px] text-muted-foreground">{fmtWhen(c.startedAt)}, {titleCase(c.preset)}</span>
        <SessionStatus c={c} />
      </div>
      <p className={cn("line m-0 leading-snug text-foreground", big ? "text-[17px]" : "text-[15px]")}>{c.summary}</p>
      <SideBars {...c} />
    </>
  );
  if (!onOpen) return <div className={cn("session-card flex flex-col gap-3 rounded-2xl border border-border bg-card p-4", className)}>{body}</div>;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open session from ${fmtWhen(c.startedAt)}`}
      className={cn("session-card group relative flex w-full flex-col gap-3 rounded-2xl border border-border bg-card p-4 pr-10 text-left shadow-[0_1px_2px_rgba(23,20,15,0.04)] transition-[border,box-shadow,transform] hover:border-foreground/20 hover:shadow-[0_12px_28px_-18px_rgba(23,20,15,0.35)] active:translate-y-px", className)}
    >
      {body}
      <ChevronRight aria-hidden="true" className="absolute top-1/2 right-3 size-[18px] -translate-y-1/2 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
