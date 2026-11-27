// Patient bench (simulated players, not patients): Purna's measures must separate three search
// styles on the same layouts. See docs/06-TESTING.md §2.

import { describe, expect, it } from "vitest";
import { runPlayer } from "./bench";

const SEEDS = 200;

describe("patient bench (simulated)", () => {
  const healthy = [] as ReturnType<typeof runPlayer>[];
  const neglect = [] as ReturnType<typeof runPlayer>[];
  const object = [] as ReturnType<typeof runPlayer>[];
  for (let s = 1; s <= SEEDS; s++) {
    healthy.push(runPlayer("healthy", s));
    neglect.push(runPlayer("leftNeglect", s));
    object.push(runPlayer("objectNeglect", s));
  }

  it("healthy: finds everything, no chipped mistakes, no hints, orderly", () => {
    for (const r of healthy) {
      expect(r.near.leftHits).toBe(r.near.leftTotal);
      expect(r.near.rightHits).toBe(r.near.rightTotal);
      expect(r.near.fpChipLeft + r.near.fpChipRight).toBe(0);
      expect(r.cues.hint1).toBe(0);
      expect(Math.abs(r.near.coc!)).toBeLessThan(0.2);
      expect(r.near.bestR!).toBeGreaterThan(0.6);
    }
  });

  it("left neglect vs healthy on the same layout: further right, less turning left, needs hints", () => {
    let missedLeft = 0;
    let dCoc = 0;
    let ego = 0;
    for (let i = 0; i < SEEDS; i++) {
      const h = healthy[i];
      const n = neglect[i];
      expect(n.near.coc!).toBeGreaterThanOrEqual(h.near.coc! - 1e-9);
      expect(n.head.pctTimeLeft).toBeLessThan(h.head.pctTimeLeft);
      expect(n.cues.hint1).toBeGreaterThanOrEqual(1);
      if (n.near.leftHits < n.near.leftTotal) missedLeft++;
      dCoc += n.near.coc! - h.near.coc!;
      ego += n.near.egoAsym;
    }
    expect(missedLeft / SEEDS).toBeGreaterThanOrEqual(0.95);
    expect(dCoc / SEEDS).toBeGreaterThan(0.15);
    expect(ego / SEEDS).toBeGreaterThan(0.15);
  });

  it("object neglect: finds every whole diya but lights chipped-on-left ones, never chipped-on-right", () => {
    for (const r of object) {
      expect(r.near.leftHits).toBe(r.near.leftTotal);
      expect(r.near.fpChipLeft).toBeGreaterThanOrEqual(2);
      expect(r.near.fpChipRight).toBe(0);
      expect(r.near.alloAsym).toBeGreaterThanOrEqual(2);
      expect(Math.abs(r.near.coc!)).toBeLessThan(0.2);
    }
  });

  it("with the warm-up and far board on, a healthy player still clears every phase", () => {
    for (let seed = 1; seed <= 30; seed++) {
      const r = runPlayer("healthy", seed, { drift: true, far: true });
      expect(r.drift!.hits).toBe(r.drift!.flickers);
      expect(r.drift!.misses).toBe(0);
      expect(r.near.leftHits).toBe(r.near.leftTotal);
      expect(r.far!.leftHits + r.far!.rightHits).toBe(r.far!.leftTotal + r.far!.rightTotal);
      expect(r.far!.endedBy).toBe("complete");
    }
  });
});
