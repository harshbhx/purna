// Turns a purna.session.v1 into what the screens show.
import { fix, pct, titleCase } from "./format";
import type { SessionCard, SessionJson } from "./types";

export function toCard(s: SessionJson): SessionCard {
  const n = s.near;
  return {
    id: s.sessionId, startedAt: s.startedAt, preset: s.settings.preset, summary: s.summary,
    leftHits: n.leftHits, leftTotal: n.leftTotal, rightHits: n.rightHits, rightTotal: n.rightTotal,
    leftPct: n.leftTotal ? n.leftHits / n.leftTotal : null, rightPct: n.rightTotal ? n.rightHits / n.rightTotal : null,
    coc: n.coc, hints: s.cues.hint1 + s.cues.hint2, maxLeftDeg: s.head.maxLeftDeg, endedBy: n.endedBy,
  };
}

/** The four report tiles, in plain words (docs/01-PRD.md §8). */
export function measures(s: SessionJson): { label: string; value: string }[] {
  const n = s.near;
  const chipped = n.fpChipLeft + n.fpChipRight === 0 ? "None lit by mistake" : `Gap on left: ${n.fpChipLeft} lit, gap on right: ${n.fpChipRight} lit`;
  const order = n.bestR === null ? "Too few to tell" : `Orderly ${fix(n.bestR)}, ${n.crossings} crossing${n.crossings === 1 ? "" : "s"}, ${n.revisits} revisit${n.revisits === 1 ? "" : "s"}`;
  return [
    { label: "Left vs right", value: `Left ${n.leftHits}/${n.leftTotal}, right ${n.rightHits}/${n.rightTotal}` },
    { label: "Chipped diyas", value: chipped },
    { label: "Search order", value: order },
    { label: "Head turn", value: `Up to ${Math.round(s.head.maxLeftDeg)}° left` },
  ];
}

const cols = (a: (number | null)[]) => a.map((t) => (t === null ? "–" : t.toFixed(1) + " s")).join(" / ");

export function therapistRows(s: SessionJson): [string, string][] {
  const n = s.near;
  const rows: [string, string][] = [
    ["Started", new Date(s.startedAt).toLocaleString()],
    ["Duration", s.durationS.toFixed(0) + " s"],
    ["Difficulty", titleCase(s.settings.preset)],
    ["Hint after", s.settings.hintDelayS + " s"],
    ["Beam start / end", `${s.settings.beamStart} / ${s.cues.beamEnd}`],
    ["Hints (bell / sweep)", `${s.cues.hint1} / ${s.cues.hint2}`],
    ["Table ended by", n.endedBy],
    ["Left found", `${n.leftHits}/${n.leftTotal} (${pct(n.leftTotal ? n.leftHits / n.leftTotal : null)})`],
    ["Right found", `${n.rightHits}/${n.rightTotal} (${pct(n.rightTotal ? n.rightHits / n.rightTotal : null)})`],
    ["Centre of Cancellation", fix(n.coc)],
    ["Egocentric asymmetry", fix(n.egoAsym)],
    ["Allocentric asymmetry", String(n.alloAsym)],
    ["Best r (search order)", fix(n.bestR)],
    ["Path crossings", String(n.crossings)],
    ["Revisits", String(n.revisits)],
    ["Mean step", n.meanStepCm === null ? "–" : n.meanStepCm.toFixed(1) + " cm"],
    ["Time per find, L / C / R", cols(n.timeByColumnS)],
    ["Head: max left / right", `${s.head.maxLeftDeg.toFixed(0)}° / ${s.head.maxRightDeg.toFixed(0)}°`],
    ["Time turned left", pct(s.head.pctTimeLeft)],
  ];
  if (s.far) rows.push(["Far board found", `L ${s.far.leftHits}/${s.far.leftTotal}, R ${s.far.rightHits}/${s.far.rightTotal}, CoC ${fix(s.far.coc)}`]);
  if (s.drift) rows.push(["Warm-up flickers", `${s.drift.hits} caught of ${s.drift.flickers} (${s.drift.misses} misses)`]);
  rows.push(["Lens version", s.lensVersion], ["Session id", s.sessionId]);
  return rows;
}

/** First-three vs last-three comparison for the therapist's summary tiles; null when there are fewer than 4 sessions. */
export function progress(sessionsNewestFirst: SessionJson[]) {
  if (sessionsNewestFirst.length < 4) return null;
  const k = Math.min(3, Math.floor(sessionsNewestFirst.length / 2));
  const last = sessionsNewestFirst.slice(0, k);
  const first = sessionsNewestFirst.slice(-k);
  const leftPct = (ss: SessionJson[]) => ss.reduce((a, s) => a + s.near.leftHits, 0) / Math.max(1, ss.reduce((a, s) => a + s.near.leftTotal, 0));
  const mean = (ss: SessionJson[], f: (s: SessionJson) => number) => ss.reduce((a, s) => a + f(s), 0) / ss.length;
  return {
    k,
    left: [leftPct(first), leftPct(last)] as const,
    coc: [mean(first, (s) => s.near.coc ?? 0), mean(last, (s) => s.near.coc ?? 0)] as const,
    hints: [mean(first, (s) => s.cues.hint1 + s.cues.hint2), mean(last, (s) => s.cues.hint1 + s.cues.hint2)] as const,
  };
}

/**
 * How much the left share usually moves from one session to the next: the median absolute change between
 * consecutive sessions, drawn as a band around a 3-session rolling mean. A change inside the band may be chance.
 * Input oldest first; null for sessions with no left diyas. Needs 4 sessions.
 */
export function dayToDay(leftsOldestFirst: (number | null)[]): { spread: number; centre: (number | null)[] } | null {
  const vals = leftsOldestFirst.filter((v): v is number => v !== null);
  if (vals.length < 4) return null;
  const diffs = vals.slice(1).map((v, i) => Math.abs(v - vals[i])).sort((a, b) => a - b);
  const mid = diffs.length >> 1;
  const spread = diffs.length % 2 ? diffs[mid] : (diffs[mid - 1] + diffs[mid]) / 2;
  const centre = leftsOldestFirst.map((v, i) => {
    if (v === null) return null;
    const win = leftsOldestFirst.slice(Math.max(0, i - 2), i + 1).filter((w): w is number => w !== null);
    return win.reduce((a, b) => a + b, 0) / win.length;
  });
  return { spread, centre };
}

/**
 * Where the searching time went: mean seconds to find a diya in the left, centre and right thirds, for the earliest
 * and the most recent sessions (up to 3 each), plus the share of time the head was turned left.
 */
export function lookStats(sessionsNewestFirst: SessionJson[]) {
  if (!sessionsNewestFirst.length) return null;
  const k = sessionsNewestFirst.length >= 2 ? Math.max(1, Math.min(3, Math.floor(sessionsNewestFirst.length / 2))) : 1;
  const recent = sessionsNewestFirst.slice(0, k);
  const earlier = sessionsNewestFirst.length >= 2 ? sessionsNewestFirst.slice(-k) : null;
  const cols = (ss: SessionJson[]) =>
    [0, 1, 2].map((c) => {
      const v = ss.map((s) => s.near.timeByColumnS[c]).filter((x): x is number => typeof x === "number");
      return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
    }) as [number | null, number | null, number | null];
  const left = (ss: SessionJson[]) => ss.reduce((a, s) => a + s.head.pctTimeLeft, 0) / ss.length;
  return { k, recent: { cols: cols(recent), timeLeft: left(recent) }, earlier: earlier && { cols: cols(earlier), timeLeft: left(earlier) } };
}

/** Published references for the measures, shown as context only (docs/10-RESEARCH.md M7–M9). */
export const COC_REFERENCE = 0.081;
