import { describe, expect, it } from "vitest";
import { DRIFT_DIRECTION, driftVisible, driftX, flickerAt, planDrift } from "../../Assets/Scripts/Core/Drift";
import { PurnaEngine } from "../../Assets/Scripts/Core/PurnaEngine";

describe("Drift", () => {
  it("only ever moves leftward (safety rule: rightward motion can worsen neglect)", () => {
    expect(DRIFT_DIRECTION).toBe(-1);
    for (let seed = 1; seed <= 50; seed++) {
      const plan = planDrift(seed, 45);
      for (const it of plan.items) {
        let prev = Infinity;
        for (let t = it.spawnT; t < it.spawnT + 8; t += 0.05) {
          const x = driftX(it, t);
          expect(x).toBeLessThan(prev);
          prev = x;
        }
      }
    }
  });

  it("flicker windows never overlap and are on visible items", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const plan = planDrift(seed, 45);
      expect(plan.flickers.length).toBeGreaterThan(5);
      for (let i = 1; i < plan.flickers.length; i++) expect(plan.flickers[i].t0).toBeGreaterThan(plan.flickers[i - 1].t1);
      for (const w of plan.flickers) {
        const it = plan.items.find((i) => i.id === w.id)!;
        expect(driftVisible(plan, it, w.t0)).toBe(true);
        expect(driftVisible(plan, it, w.t1)).toBe(true);
        expect(flickerAt(plan, w.id, (w.t0 + w.t1) / 2)).toBe(w);
      }
    }
  });

  it("in the engine, a pinch during a flicker is a hit once; anything else is a miss", () => {
    const e = new PurnaEngine({ drift: true, seed: 3 });
    e.start(0);
    const f = e.tick(0, 0);
    expect(f.phase).toBe("drift");
    const plan = planDrift(3, 45);
    const w = plan.flickers[0];
    const mid = (w.t0 + w.t1) / 2;
    const frame = e.tick(mid, 0);
    expect(frame.drift!.find((d) => d.id === w.id)!.flicker).toBe(true);
    expect(frame.drift!.every((d) => d.x >= plan.minX)).toBe(true);
    expect(e.pinch(mid, w.id, 0)).toBe("drift-hit");
    expect(e.pinch(mid + 0.1, w.id, 0)).toBe("drift-miss");
    expect(e.pinch(w.t1 + 0.5, w.id, 0)).toBe("drift-miss");
    e.tick(45, 0); // drift times out into the table task
    expect(e.phase).toBe("near");
    const r = e.report("2026-12-03T00:00:00.000Z", "s_test");
    expect(r.drift).toEqual({ flickers: plan.flickers.length, hits: 1, misses: 2 });
  });
});
