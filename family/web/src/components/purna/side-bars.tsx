// Left and right found as two bars. The numbers are text, so colour is never the only signal.
export function SideBars({ leftHits, leftTotal, rightHits, rightTotal }: { leftHits: number; leftTotal: number; rightHits: number; rightTotal: number }) {
  const row = (label: string, h: number, t: number, cls: string) => (
    <div className="grid grid-cols-[44px_1fr_34px] items-center gap-2.5 text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      <div role="img" aria-label={`${label}: ${h} of ${t} found`} className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${cls}`} style={{ width: `${t ? Math.round((h / t) * 100) : 0}%` }} />
      </div>
      <span className="text-right tabular-nums">{h}/{t}</span>
    </div>
  );
  return (
    <div className="flex flex-col gap-1.5">
      {row("Left", leftHits, leftTotal, "bg-side-l")}
      {row("Right", rightHits, rightTotal, "bg-side-r")}
    </div>
  );
}
