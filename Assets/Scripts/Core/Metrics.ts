// Turns one task's pinch log into the measures on the report (docs/03-ARCHITECTURE.md §5).
// Egocentric = which half of the table; object-centred = which side of each diya's gap.

import { EndedBy, Field, Item, round1, round3, usableX } from "./PurnaTypes";
import { Pt, bestR, countCrossings, meanStep } from "./PathMetrics";

export type PinchResult = "lit" | "chipped" | "revisit";

export interface PinchEvent {
  t: number; // seconds since the task started
  id: number;
  r: PinchResult;
  yaw: number;
}

export interface ItemJson {
  id: number;
  x: number;
  u: number;
  kind: "whole" | "chipped";
  chip: "L" | "R" | null;
  side: "L" | "R";
}

export interface FieldResult {
  endedBy: EndedBy;
  items: ItemJson[];
  events: PinchEvent[];
  leftHits: number;
  leftTotal: number;
  rightHits: number;
  rightTotal: number;
  fpChipLeft: number;
  fpChipRight: number;
  revisits: number;
  egoAsym: number;
  alloAsym: number;
  coc: number | null;
  bestR: number | null;
  crossings: number;
  meanStepCm: number | null;
  timeByColumnS: (number | null)[];
}

export interface HeadStats {
  maxLeftDeg: number;
  maxRightDeg: number;
  pctTimeLeft: number;
  /** Share of table-task time the head pointed at each strip of the table, left edge first (ATTENTION_BINS strips). */
  attention?: number[];
}

/** The attention map splits the table into this many strips, 5 cm each on the 70 cm table. */
export const ATTENTION_BINS = 14;

/** Degrees of yaw that count as "turned left" for pctTimeLeft. */
export const LEFT_TURN_DEG = 5;

function byId(items: Item[]): { [id: number]: Item } {
  const m: { [id: number]: Item } = {};
  for (const it of items) m[it.id] = it;
  return m;
}

/** Centre of Cancellation: mean normalised x of lit whole diyas, -1 (left edge) .. +1 (right edge). */
export function centreOfCancellation(field: Field, xs: number[]): number | null {
  if (xs.length === 0) return null;
  const ux = usableX(field);
  let s = 0;
  for (const x of xs) s += (2 * (x - ux.min)) / (ux.max - ux.min) - 1;
  return s / xs.length;
}

export function fieldResult(field: Field, items: Item[], events: PinchEvent[], endedBy: EndedBy): FieldResult {
  const map = byId(items);
  const lit: Item[] = [];
  const litTimes: number[] = [];
  const chippedSeen: { [id: number]: boolean } = {};
  let fpL = 0;
  let fpR = 0;
  let revisits = 0;
  for (const e of events) {
    const it = map[e.id];
    if (!it) continue;
    if (e.r === "lit" && it.kind === "whole") {
      lit.push(it);
      litTimes.push(e.t);
    } else if (e.r === "chipped" && it.kind === "chipped" && !chippedSeen[it.id]) {
      chippedSeen[it.id] = true;
      if (it.chip === "L") fpL++;
      else if (it.chip === "R") fpR++;
    } else if (e.r === "revisit") {
      revisits++;
    }
  }
  let leftTotal = 0;
  let rightTotal = 0;
  for (const it of items) {
    if (it.kind !== "whole") continue;
    if (it.side === "L") leftTotal++;
    else rightTotal++;
  }
  let leftHits = 0;
  let rightHits = 0;
  for (const it of lit) {
    if (it.side === "L") leftHits++;
    else rightHits++;
  }
  const hits = leftHits + rightHits;
  const path: Pt[] = lit.map((it) => ({ x: it.x, u: it.u }));
  const coc = centreOfCancellation(
    field,
    lit.map((it) => it.x),
  );
  const br = bestR(path);
  const step = meanStep(path);

  // Mean time to find, by thirds of the usable width.
  const ux = usableX(field);
  const third = (ux.max - ux.min) / 3;
  const sums = [0, 0, 0];
  const counts = [0, 0, 0];
  let prev = 0;
  for (let i = 0; i < lit.length; i++) {
    const col = lit[i].x < ux.min + third ? 0 : lit[i].x < ux.min + 2 * third ? 1 : 2;
    sums[col] += litTimes[i] - prev;
    counts[col]++;
    prev = litTimes[i];
  }

  return {
    endedBy,
    items: items.map((it) => ({ id: it.id, x: round1(it.x), u: round1(it.u), kind: it.kind, chip: it.chip, side: it.side })),
    events: events.map((e) => ({ t: Math.round(e.t * 100) / 100, id: e.id, r: e.r, yaw: round1(e.yaw) })),
    leftHits,
    leftTotal,
    rightHits,
    rightTotal,
    fpChipLeft: fpL,
    fpChipRight: fpR,
    revisits,
    egoAsym: hits === 0 ? 0 : round3((rightHits - leftHits) / hits),
    alloAsym: fpL - fpR,
    coc: coc === null ? null : round3(coc),
    bestR: br === null ? null : round3(br),
    crossings: countCrossings(path),
    meanStepCm: step === null ? null : round1(step),
    timeByColumnS: [0, 1, 2].map((c) => (counts[c] === 0 ? null : round1(sums[c] / counts[c]))),
  };
}

export function headStats(samples: { t: number; yaw: number }[]): HeadStats {
  if (samples.length === 0) return { maxLeftDeg: 0, maxRightDeg: 0, pctTimeLeft: 0 };
  let maxL = 0;
  let maxR = 0;
  let left = 0;
  for (const s of samples) {
    if (s.yaw > maxL) maxL = s.yaw;
    if (-s.yaw > maxR) maxR = -s.yaw;
    if (s.yaw > LEFT_TURN_DEG) left++;
  }
  return { maxLeftDeg: round1(maxL), maxRightDeg: round1(maxR), pctTimeLeft: round3(left / samples.length) };
}

/**
 * Where the head pointed during the table task, as a share of time per strip of the table.
 * The head sits at the origin and the table's centre line is `field.centerZ` cm ahead, so a yaw of
 * θ (positive = left) points at x = centerZ · tan(θ) on that line (centerZ is negative). Points past
 * the edges count for the edge strip. Samples are evenly spaced (YAW_SAMPLE_S), so a count is time.
 */
export function attentionMap(samples: { yaw: number }[], field: Field, bins: number = ATTENTION_BINS): number[] {
  const out: number[] = [];
  for (let i = 0; i < bins; i++) out.push(0);
  if (samples.length === 0) return out;
  const half = field.width / 2;
  const dist = Math.abs(field.centerZ);
  for (const s of samples) {
    const x = field.centerX - dist * Math.tan((s.yaw * Math.PI) / 180);
    let b = Math.floor(((x + half - field.centerX) / field.width) * bins);
    if (b < 0) b = 0;
    if (b > bins - 1) b = bins - 1;
    out[b]++;
  }
  return out.map((c) => round3(c / samples.length));
}
