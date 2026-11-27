// Drift warm-up (add-on, docs/01-PRD.md L13): a stream of diyas floats LEFTWARD across the table;
// one at a time flickers for 2 s and should be pinched. Leftward pursuit can reduce neglect while
// rightward pursuit may worsen it (docs/10-RESEARCH.md E3), so the direction is a constant.

import { NEAR_FIELD, usableX } from "./PurnaTypes";
import { rng } from "./Rng";

export const DRIFT_SPEED_CMS = 10;
export const DRIFT_DIRECTION = -1; // leftward. Never change: a unit test fails the build if anything moves right.
export const DRIFT_SPAWN_EVERY_S = 1.0;
export const DRIFT_FLICKER_S = 2.0;
export const DRIFT_ID_BASE = 1000;

export interface DriftItem {
  id: number;
  spawnT: number; // seconds since the drift task started
  startX: number;
  u: number;
}

export interface FlickerWindow {
  id: number;
  t0: number;
  t1: number;
}

export interface DriftPlan {
  items: DriftItem[];
  flickers: FlickerWindow[];
  minX: number;
  maxX: number;
}

export function driftX(item: DriftItem, t: number): number {
  return item.startX + DRIFT_DIRECTION * DRIFT_SPEED_CMS * (t - item.spawnT);
}

export function driftVisible(plan: DriftPlan, item: DriftItem, t: number): boolean {
  if (t < item.spawnT) return false;
  return driftX(item, t) >= plan.minX;
}

export function planDrift(seed: number, durationS: number): DriftPlan {
  const r = rng((seed >>> 0) ^ 0x5eed);
  const ux = usableX(NEAR_FIELD);
  const minX = ux.min;
  const maxX = ux.max;
  const items: DriftItem[] = [];
  for (let i = 0; i * DRIFT_SPAWN_EVERY_S < durationS; i++) {
    items.push({ id: DRIFT_ID_BASE + i, spawnT: i * DRIFT_SPAWN_EVERY_S, startX: maxX, u: Math.round((r() * 8 - 4) * 10) / 10 });
  }
  const flickers: FlickerWindow[] = [];
  let t = 2.5;
  while (t + DRIFT_FLICKER_S <= durationS) {
    // Pick an item that is on the table for the whole window, preferring one right of centre so
    // following it means following it leftward.
    const candidates = items.filter((it) => {
      const xa = driftX(it, t);
      const xb = driftX(it, t + DRIFT_FLICKER_S);
      return t >= it.spawnT && xa <= maxX && xb >= minX && xa > 0;
    });
    if (candidates.length > 0) {
      const pick = candidates[Math.floor(r() * candidates.length)];
      flickers.push({ id: pick.id, t0: t, t1: t + DRIFT_FLICKER_S });
    }
    t += DRIFT_FLICKER_S + 1 + r() * 1; // a gap of 1-2 s between flickers: windows never overlap
  }
  return { items, flickers, minX, maxX };
}

/** The flicker window an item is in at time t, or null. */
export function flickerAt(plan: DriftPlan, id: number, t: number): FlickerWindow | null {
  for (const w of plan.flickers) if (w.id === id && t >= w.t0 && t <= w.t1) return w;
  return null;
}
