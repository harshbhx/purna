import { describe, expect, it } from "vitest";
import { bestR, countCrossings, meanStep, pearson, segmentsIntersect } from "../../Assets/Scripts/Core/PathMetrics";

describe("pearson", () => {
  it("is ±1 on lines and 0 when undefined", () => {
    expect(pearson([1, 2, 3], [2, 4, 6])).toBeCloseTo(1);
    expect(pearson([1, 2, 3], [6, 4, 2])).toBeCloseTo(-1);
    expect(pearson([1, 2, 3], [5, 5, 5])).toBe(0);
    expect(pearson([1], [1])).toBe(0);
  });
});

describe("crossings", () => {
  const p = (x: number, u: number) => ({ x, u });
  it("counts only proper crossings", () => {
    expect(segmentsIntersect(p(0, 0), p(10, 10), p(0, 10), p(10, 0))).toBe(true);
    expect(segmentsIntersect(p(0, 0), p(10, 0), p(10, 0), p(10, 10))).toBe(false); // shared endpoint
    expect(segmentsIntersect(p(0, 0), p(1, 1), p(5, 5), p(6, 6))).toBe(false); // collinear, apart
  });
  it("a square visited along its diagonals crosses once; a tidy sweep never does", () => {
    expect(countCrossings([p(0, 0), p(10, 10), p(0, 10), p(10, 0)])).toBe(1);
    expect(countCrossings([p(0, 0), p(10, 0), p(20, 0), p(20, 10), p(10, 10), p(0, 10)])).toBe(0);
  });
  it("a zig-zag that doubles back crosses a known number of times", () => {
    // 0,0 -> 10,10 -> 10,0 -> 0,10 -> 5,-5
    expect(countCrossings([p(0, 0), p(10, 10), p(10, 0), p(0, 10), p(5, -5)])).toBe(2);
  });
});

describe("bestR and meanStep", () => {
  const p = (x: number, u: number) => ({ x, u });
  it("an ordered sweep is near 1; too few points is null", () => {
    expect(bestR([p(-30, 0), p(-10, 5), p(10, -5), p(30, 0)])!).toBeGreaterThan(0.95);
    expect(bestR([p(0, 0), p(1, 1)])).toBeNull();
    expect(meanStep([p(0, 0), p(3, 4), p(3, 8)])).toBeCloseTo(4.5);
    expect(meanStep([p(0, 0)])).toBeNull();
  });
});
