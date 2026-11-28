// "Where the time went": seconds to find a diya in each third of the table, earliest vs most recent sessions.
// Longer bars on the left mean the left took longer to search. Values are written on the bars, so colour isn't needed.
import { lookStats } from "@/lib/session";
import type { SessionJson } from "@/lib/types";

const COLS = ["Left third", "Centre", "Right third"];
const fmt = (v: number | null) => (v === null ? "none found" : `${v.toFixed(1)} s`);

export function LookChart({ sessions }: { sessions: SessionJson[] }) {
  const st = lookStats(sessions);
  if (!st) return <p className="m-0 text-muted-foreground">No sessions yet.</p>;
  const many = (n: string) => (st.k === 1 ? `${n} session` : `${n} ${st.k} sessions`);
  const rows = [
    ...(st.earlier ? [{ name: many("First"), ...st.earlier, cls: "bg-muted-foreground/45" }] : []),
    { name: many("Latest"), ...st.recent, cls: "bg-foreground" },
  ];
  const max = Math.max(1, ...rows.flatMap((r) => r.cols.map((v) => v ?? 0)));
  const label = rows.map((r) => `${r.name}: ${COLS.map((c, i) => `${c} ${fmt(r.cols[i])}`).join(", ")}; head turned left ${Math.round(r.timeLeft * 100)}% of the time`).join(". ");
  return (
    <figure className="m-0" role="img" aria-label={`Seconds to find a diya by part of the table. ${label}.`}>
      <div className="grid gap-4 sm:grid-cols-3">
        {COLS.map((c, i) => (
          <div key={c} className="flex flex-col gap-2">
            <div className="text-[13px] font-semibold">{c}</div>
            {rows.map((r) => (
              <div key={r.name} className="flex items-center gap-2">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden>
                  <div className={`h-full rounded-full ${r.cls}`} style={{ width: `${((r.cols[i] ?? 0) / max) * 100}%` }} />
                </div>
                <span className="w-[4.5rem] shrink-0 text-right text-[12px] tabular-nums text-muted-foreground">{fmt(r.cols[i])}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <figcaption className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-muted-foreground">
        {rows.map((r) => (
          <span key={r.name} className="inline-flex items-center gap-2">
            <span aria-hidden className={`inline-block size-2.5 rounded-full ${r.cls}`} />
            {r.name}: head turned left {Math.round(r.timeLeft * 100)}% of the time
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
