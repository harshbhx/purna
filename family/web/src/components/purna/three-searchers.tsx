// "Three ways to search the same table": one layout (seed 23) played by the three simulated searchers
// from tools/test/bench.ts through the real engine, so a reader can see what each measure catches.
import { useRef, useState, type KeyboardEvent } from "react";
import three from "@/data/three.json";
import { Replay } from "@/components/purna/replay";
import { SideBars } from "@/components/purna/side-bars";
import { fix } from "@/lib/format";
import type { SessionJson } from "@/lib/types";
import { cn } from "@/lib/utils";

type Player = "healthy" | "leftNeglect" | "objectNeglect";
type MeasureKey = "sides" | "centre" | "chipped" | "order" | "hints";

export const SEARCHERS = (three as { player: Player; session: SessionJson }[]).map((t) => t);

const TAB: Record<Player, { label: string; short: string }> = {
  healthy: { label: "Searches the whole table", short: "Whole table" },
  leftNeglect: { label: "Misses the left of the table", short: "Left of the table" },
  objectNeglect: { label: "Misses the left of each diya", short: "Left of each diya" },
};

/** Which measures give each searcher away, and the sentence that says so. Numbers come from the session. */
export function verdict(player: Player, s: SessionJson): { keys: MeasureKey[]; text: string } {
  const n = s.near;
  const hints = s.cues.hint1 + s.cues.hint2;
  if (player === "leftNeglect")
    return {
      keys: ["sides", "centre", "order", "hints"],
      text: `${n.leftTotal - n.leftHits} diyas missed on the left, the search sat right of centre, the path crossed itself ${n.crossings} times, and it took ${hints} hint${hints === 1 ? "" : "s"}. The head turned only ${Math.round(s.head.maxLeftDeg)}° left.`,
    };
  if (player === "objectNeglect")
    return {
      keys: ["chipped"],
      text: `Every whole diya found, so the left and right bars look perfect. The chipped diyas give it away: ${n.fpChipLeft} with the gap on the left were lit, ${n.fpChipRight} with the gap on the right.`,
    };
  return { keys: [], text: "Every whole diya found, no chipped diya lit, row by row, and no hints. Nothing stands out, which is the point." };
}

function CentreScale({ coc }: { coc: number | null }) {
  const pos = coc === null ? 50 : 50 + Math.max(-1, Math.min(1, coc)) * 50;
  return (
    <div role="img" aria-label={coc === null ? "No diyas lit" : `Centre of the search at ${fix(coc)}, where −1 is the far left and +1 the far right`} className="relative mt-1 h-6">
      <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
      <div className="absolute top-1/2 left-1/2 h-3 w-px -translate-y-1/2 bg-muted-foreground/60" />
      <div className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground shadow transition-[left] duration-500 motion-reduce:transition-none" style={{ left: `${pos}%` }} />
      <span className="absolute -bottom-3 left-0 text-[11px] text-muted-foreground">Left</span>
      <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[11px] text-muted-foreground">Middle</span>
      <span className="absolute right-0 -bottom-3 text-[11px] text-muted-foreground">Right</span>
    </div>
  );
}

function Row({ k, hot, title, help, value, children }: { k: MeasureKey; hot: boolean; title: string; help: string; value: string; children?: React.ReactNode }) {
  return (
    <div data-measure={k} data-hot={hot || undefined} className={cn("grid grid-cols-[1fr_auto] items-baseline gap-x-4 rounded-2xl border p-4 transition-colors duration-300 motion-reduce:transition-none", hot ? "border-flame/50 bg-warn-bg" : "border-border bg-card")}>
      <dt className="m-0 text-[15px] font-semibold">{title}</dt>
      <dd className="m-0 text-right text-[15px] font-semibold tabular-nums">{value}</dd>
      <dd className="col-span-2 m-0 mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
        {help}
        {children && <div className="mt-3 text-foreground">{children}</div>}
      </dd>
    </div>
  );
}

export function ThreeSearchers() {
  const [i, setI] = useState(1);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const { player, session } = SEARCHERS[i];
  const n = session.near;
  const v = verdict(player, session);
  const hot = (k: MeasureKey) => v.keys.includes(k);
  const hints = session.cues.hint1 + session.cues.hint2;

  function onKey(e: KeyboardEvent) {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    const to = e.key === "Home" ? 0 : e.key === "End" ? SEARCHERS.length - 1 : d ? (i + d + SEARCHERS.length) % SEARCHERS.length : -1;
    if (to < 0) return;
    e.preventDefault();
    setI(to);
    tabs.current[to]?.focus();
  }

  return (
    <div id="three">
      <div role="tablist" aria-label="Choose a searcher" onKeyDown={onKey} className="grid w-full grid-cols-3 gap-1 rounded-2xl border border-border bg-card p-1 sm:inline-flex sm:w-auto">
        {SEARCHERS.map((t, j) => (
          <button
            key={t.player}
            ref={(el) => { tabs.current[j] = el; }}
            id={`tab-${t.player}`}
            role="tab"
            type="button"
            aria-selected={i === j}
            aria-controls="three-panel"
            tabIndex={i === j ? 0 : -1}
            onClick={() => setI(j)}
            className={cn(
              "rounded-xl px-2 py-2 text-[13px] leading-tight font-medium transition-colors motion-reduce:transition-none sm:px-3.5 sm:text-[14px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              i === j ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <span className="hidden sm:inline">{TAB[t.player].label}</span>
            <span className="sm:hidden">{TAB[t.player].short}</span>
          </button>
        ))}
      </div>

      <div id="three-panel" role="tabpanel" aria-labelledby={`tab-${player}`} className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_1fr] [&>*]:min-w-0">
        <figure className="m-0 self-start lg:sticky lg:top-24">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-[0_24px_48px_-32px_rgba(23,20,15,0.3)]">
            <Replay session={session} replayKey={i} />
          </div>
          <figcaption id="three-verdict" aria-live="polite" className="mt-4 text-[16px] leading-relaxed">{v.text}</figcaption>
        </figure>

        <dl className="m-0 flex flex-col gap-3">
          <Row k="sides" hot={hot("sides")} title="Left and right found" help="Whole diyas lit on each half of the table." value={`${n.leftHits + n.rightHits}/${n.leftTotal + n.rightTotal}`}>
            <SideBars leftHits={n.leftHits} leftTotal={n.leftTotal} rightHits={n.rightHits} rightTotal={n.rightTotal} />
          </Row>
          <Row k="centre" hot={hot("centre")} title="Where the search sat" help="Centre of Cancellation: the average spot of the lit diyas. Near 0 means the whole table was searched." value={fix(n.coc)}>
            <div className="pb-3"><CentreScale coc={n.coc} /></div>
          </Row>
          <Row k="chipped" hot={hot("chipped")} title="Chipped diyas lit" help="Lighting the ones with a gap on the left means missing the left side of each object, not of the room." value={`${n.fpChipLeft} left, ${n.fpChipRight} right`} />
          <Row k="order" hot={hot("order")} title="Search order" help="How tidy the path was, from 0 (scattered) to 1 (row by row), and how often it crossed itself." value={n.bestR === null ? "–" : `${fix(n.bestR)}, ${n.crossings} crossing${n.crossings === 1 ? "" : "s"}`} />
          <Row k="hints" hot={hot("hints")} title="Hints and head turn" help="How often the bell rang, and how far the head turned left." value={`${hints} hint${hints === 1 ? "" : "s"}, ${Math.round(session.head.maxLeftDeg)}° left`} />
        </dl>
      </div>
    </div>
  );
}
