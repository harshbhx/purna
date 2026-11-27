// Patient bench: three scripted players drive the real engine (simulated, not clinical).
// Used by bench.test.ts to prove the report's measures separate different search styles.

import { PurnaEngine } from "../../Assets/Scripts/Core/PurnaEngine";
import { Item, NEAR_FIELD, Settings, yawFromForward } from "../../Assets/Scripts/Core/PurnaTypes";
import { SessionJson } from "../../Assets/Scripts/Core/Report";
import { rng, shuffled } from "../../Assets/Scripts/Core/Rng";

export type Player = "healthy" | "leftNeglect" | "objectNeglect";

const DT = 0.1; // simulation step, seconds
const FIND_EVERY = 1.0; // a find takes about a second
const NEGLECT_EDGE = -12; // a left-neglect player doesn't attend left of this...
const CUED_REACH = -22; // ...unless just cued, and even then not past this

function yawTo(it: Item): number {
  return yawFromForward(it.x, NEAR_FIELD.centerZ + it.u);
}

/** Healthy reading order: rows of 10 cm from far to near, left to right in each row. */
function sweepOrder(items: Item[]): Item[] {
  return items.slice().sort((a, b) => {
    const ra = Math.floor((a.u + 30) / 10);
    const rb = Math.floor((b.u + 30) / 10);
    return ra !== rb ? ra - rb : a.x - b.x;
  });
}

export function runPlayer(player: Player, seed: number, settings?: Partial<Settings>): SessionJson {
  const e = new PurnaEngine({ seed, ...settings });
  const r = rng(seed * 31 + 7);
  e.start(0);
  let t0 = 0;
  // Warm-up (if on): catch every flicker about half a second after it starts (an item can flicker more than once).
  if (e.phase === "drift") {
    const flickerStart = new Map<number, number>();
    const caught = new Set<string>();
    for (; e.phase === "drift" && t0 < 120; t0 += DT) {
      const f = e.tick(t0, 0);
      for (const d of f.drift ?? []) {
        if (!d.flicker) {
          flickerStart.delete(d.id);
          continue;
        }
        if (!flickerStart.has(d.id)) flickerStart.set(d.id, t0);
        const start = flickerStart.get(d.id)!;
        const key = d.id + "@" + start.toFixed(1);
        if (!caught.has(key) && t0 - start >= 0.5) {
          caught.add(key);
          e.pinch(t0, d.id, 0);
        }
      }
    }
  }
  const items = e.items("near");
  const wholes = items.filter((i) => i.kind === "whole");
  const chippedLeftGap = items.filter((i) => i.kind === "chipped" && i.chip === "L");

  let queue: Item[];
  if (player === "healthy") queue = sweepOrder(wholes);
  else if (player === "objectNeglect") queue = sweepOrder(wholes.concat(chippedLeftGap));
  else queue = shuffled(wholes.filter((i) => i.x > NEGLECT_EDGE), r);

  let next = t0 + FIND_EVERY;
  let lastHintT = -Infinity;
  let yaw = 0;
  const nearStart = t0;
  let clock = t0;
  for (let t = t0; e.phase === "near" && t < nearStart + 200; t += DT) {
    clock = t;
    const f = e.tick(t, yaw);
    if (f.cue !== "none") lastHintT = t;
    if (e.phase !== "near") break;
    if (t < next) continue;
    let target: Item | undefined;
    if (queue.length > 0) {
      target = queue.shift();
    } else if (player === "leftNeglect" && t - lastHintT < 3) {
      // Cueing helps a little: the nearest unlit left diya that's still within reach.
      const lit = e.litIds("near");
      const reachable = wholes
        .filter((i) => i.x <= NEGLECT_EDGE && i.x > CUED_REACH && lit.indexOf(i.id) < 0)
        .sort((a, b) => b.x - a.x);
      target = reachable[0];
    }
    if (target) {
      yaw = player === "leftNeglect" && t - lastHintT >= 3 ? Math.min(yawTo(target), 8) : yawTo(target);
      e.pinch(t, target.id, yaw);
      next = t + FIND_EVERY;
    } else {
      yaw = player === "leftNeglect" ? -5 : 0;
    }
  }
  if (e.phase === "near") {
    clock = nearStart + 200;
    e.finish(clock);
  }
  // Far board (if on): everyone lights the board's whole diyas in reading order, one a second.
  if (e.phase === "far") {
    const board = sweepOrder(e.items("far").filter((i) => i.kind === "whole"));
    let t = clock;
    for (const it of board) {
      if (e.phase !== "far") break;
      t += FIND_EVERY;
      e.tick(t, 0);
      e.pinch(t, it.id, 0);
    }
    if (e.phase === "far") e.tick(t + DT, 0); // completion is detected on the next tick
    if (e.phase === "far") e.finish(t + 2 * DT);
  }
  return e.report("2026-12-03T00:00:00.000Z", "s_bench_" + player + "_" + seed);
}
