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
