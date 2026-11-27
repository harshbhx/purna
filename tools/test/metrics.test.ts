import { describe, expect, it } from "vitest";
import { centreOfCancellation, fieldResult, headStats, PinchEvent } from "../../Assets/Scripts/Core/Metrics";
import { Item, NEAR_FIELD } from "../../Assets/Scripts/Core/PurnaTypes";

function item(id: number, x: number, u: number, kind: "whole" | "chipped", chip: "L" | "R" | null): Item {
  return { id, space: "near", x, u, kind, chip, side: x < 0 ? "L" : "R", sizeCm: 6 };
}

// A tiny hand-built table: 2 whole per side, 2 chipped per side (one gap each way).
const items: Item[] = [
  item(0, -25, 0, "whole", null),
  item(1, -10, 5, "whole", null),
  item(2, 10, 5, "whole", null),
  item(3, 25, 0, "whole", null),
  item(4, -20, -10, "chipped", "L"),
  item(5, -15, 10, "chipped", "R"),
  item(6, 15, -10, "chipped", "L"),
  item(7, 20, 10, "chipped", "R"),
];

const ev = (t: number, id: number, r: PinchEvent["r"]): PinchEvent => ({ t, id, r, yaw: 0 });

describe("centreOfCancellation", () => {
  it("is 0 for a balanced set, positive for right-only, null for none", () => {
    expect(centreOfCancellation(NEAR_FIELD, [-20, 20])).toBeCloseTo(0);
    expect(centreOfCancellation(NEAR_FIELD, [10, 25])!).toBeGreaterThan(0.3);
    expect(centreOfCancellation(NEAR_FIELD, [-31])).toBeCloseTo(-1);
    expect(centreOfCancellation(NEAR_FIELD, [])).toBeNull();
  });
});

describe("fieldResult", () => {
  it("all lit: balanced, no false positives", () => {
    const r = fieldResult(NEAR_FIELD, items, [ev(1, 0, "lit"), ev(2, 1, "lit"), ev(3, 2, "lit"), ev(4, 3, "lit")], "complete");
    expect([r.leftHits, r.leftTotal, r.rightHits, r.rightTotal]).toEqual([2, 2, 2, 2]);
    expect(r.egoAsym).toBe(0);
    expect(Math.abs(r.coc!)).toBeLessThan(0.01);
    expect(r.crossings).toBe(0);
    expect(r.bestR!).toBeGreaterThan(0.9);
    expect(r.endedBy).toBe("complete");
  });

  it("right half only: right bias", () => {
    const r = fieldResult(NEAR_FIELD, items, [ev(1, 3, "lit"), ev(2, 2, "lit")], "timeout");
    expect(r.leftHits).toBe(0);
    expect(r.egoAsym).toBe(1);
    expect(r.coc!).toBeGreaterThan(0.3);
    expect(r.bestR).toBeNull();
  });

  it("chipped pinches count once per diya, by gap side; revisits are counted", () => {
    const events = [ev(1, 4, "chipped"), ev(2, 6, "chipped"), ev(3, 4, "revisit"), ev(4, 5, "chipped"), ev(5, 0, "lit"), ev(6, 0, "revisit")];
    const r = fieldResult(NEAR_FIELD, items, events, "finish");
    expect(r.fpChipLeft).toBe(2);
    expect(r.fpChipRight).toBe(1);
    expect(r.alloAsym).toBe(1);
    expect(r.revisits).toBe(2);
  });

  it("time to find by column uses the time since the previous find", () => {
    // usable x is -31..31, thirds at -10.33 and 10.33
    const r = fieldResult(NEAR_FIELD, items, [ev(2, 3, "lit"), ev(3, 2, "lit"), ev(9, 0, "lit")], "timeout");
    expect(r.timeByColumnS).toEqual([6, 1, 2]);
    const none = fieldResult(NEAR_FIELD, items, [], "timeout");
    expect(none.timeByColumnS).toEqual([null, null, null]);
    expect(none.coc).toBeNull();
    expect(none.meanStepCm).toBeNull();
  });

  it("ignores events for unknown ids and rounds the output", () => {
    const r = fieldResult(NEAR_FIELD, items, [ev(1.234, 99, "lit"), { t: 1.236, id: 0, r: "lit", yaw: 12.345 }], "finish");
    expect(r.leftHits).toBe(1);
    expect(r.events[1].t).toBe(1.24);
    expect(r.events[1].yaw).toBe(12.3);
  });
});

describe("headStats", () => {
  it("max left/right and share of time turned left", () => {
    const h = headStats([
      { t: 0, yaw: 0 },
      { t: 0.1, yaw: 10 },
      { t: 0.2, yaw: 24.06 },
      { t: 0.3, yaw: -18 },
    ]);
    expect(h).toEqual({ maxLeftDeg: 24.1, maxRightDeg: 18, pctTimeLeft: 0.5 });
    expect(headStats([])).toEqual({ maxLeftDeg: 0, maxRightDeg: 0, pctTimeLeft: 0 });
  });
});
