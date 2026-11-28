// Left and right found as two bars. The numbers are text, so colour is never the only signal.
import { useLang, useT } from "@/lib/i18n";

export function SideBars({ leftHits, leftTotal, rightHits, rightTotal }: { leftHits: number; leftTotal: number; rightHits: number; rightTotal: number }) {
  const tr = useT();
  const hi = useLang() === "hi";
  const row = (label: string, h: number, t: number, cls: string) => (
    <div className="grid grid-cols-[44px_1fr_34px] items-center gap-2.5 text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      <div role="img" aria-label={hi ? `${label}: ${t} में से ${h} मिले` : `${label}: ${h} of ${t} found`} className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${cls}`} style={{ width: `${t ? Math.round((h / t) * 100) : 0}%` }} />
      </div>
      <span className="text-right tabular-nums">{h}/{t}</span>
    </div>
  );
  return (
    <div className="flex flex-col gap-1.5">
      {row(tr.left, leftHits, leftTotal, "bg-side-l")}
      {row(tr.right, rightHits, rightTotal, "bg-side-r")}
    </div>
  );
}
