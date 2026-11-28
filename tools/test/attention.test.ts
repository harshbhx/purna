import { describe, expect, it } from "vitest";
import { ATTENTION_BINS, attentionMap } from "../../Assets/Scripts/Core/Metrics";
import { PurnaEngine } from "../../Assets/Scripts/Core/PurnaEngine";
import { NEAR_FIELD } from "../../Assets/Scripts/Core/PurnaTypes";
import { runPlayer } from "./bench";

const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
/** Share of attention on the left half of the table (first half of the strips). */
const leftShare = (a: number[]) => sum(a.slice(0, a.length / 2));

describe("attentionMap", () => {
  it("is all zeros with no samples", () => {
    expect(attentionMap([], NEAR_FIELD)).toEqual(new Array(ATTENTION_BINS).fill(0));
  });

  it("puts a straight-ahead head in the middle strips", () => {
    const m = attentionMap([{ yaw: 0.1 }, { yaw: -0.1 }], NEAR_FIELD);
    expect(m[6] + m[7]).toBe(1);
  });

  it("maps left turns to the left of the table (positive yaw = left)", () => {
    // 25° left points at x = -65·tan 25° ≈ -30.3 cm, the first strip (-35..-30).
    const m = attentionMap([{ yaw: 25 }], NEAR_FIELD);
    expect(m[0]).toBe(1);
    const r = attentionMap([{ yaw: -25 }], NEAR_FIELD);
    expect(r[ATTENTION_BINS - 1]).toBe(1);
  });

  it("counts turns past the edge in the edge strip", () => {
    const m = attentionMap([{ yaw: 80 }, { yaw: -80 }], NEAR_FIELD);
    expect(m[0]).toBe(0.5);
    expect(m[ATTENTION_BINS - 1]).toBe(0.5);
  });

  it("shares add up to 1", () => {
    const samples = Array.from({ length: 97 }, (_, i) => ({ yaw: -30 + (60 * i) / 96 }));
    expect(sum(attentionMap(samples, NEAR_FIELD))).toBeCloseTo(1, 2);
  });
});

describe("attention in the session", () => {
  it("counts only the table task, not the warm-up", () => {
    const e = new PurnaEngine({ seed: 3, drift: true });
    e.start(0);
    let t = 0;
    for (; e.phase === "drift"; t += 0.05) e.tick(t, 40); // warm-up, looking far left
    for (const end = t + 2; t < end; t += 0.05) e.tick(t, 0); // table task, straight ahead
    expect(e.phase).toBe("near");
    const a = e.attention();
    expect(a[0]).toBe(0);
    expect(a[6] + a[7]).toBe(1);
  });

  it("is in the report and separates the searchers on the patient bench", () => {
    let healthyLeft = 0;
    let neglectLeft = 0;
    const seeds = 40;
    for (let seed = 1; seed <= seeds; seed++) {
      const h = runPlayer("healthy", seed);
      const n = runPlayer("leftNeglect", seed);
      expect(h.head.attention).toHaveLength(ATTENTION_BINS);
      healthyLeft += leftShare(h.head.attention!);
      neglectLeft += leftShare(n.head.attention!);
    }
    expect(healthyLeft / seeds).toBeGreaterThan(0.3);
    expect(neglectLeft / seeds).toBeLessThan(healthyLeft / seeds - 0.15);
  });
});
