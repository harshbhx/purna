import { describe, expect, it } from "vitest";
import { PurnaEngine } from "../../Assets/Scripts/Core/PurnaEngine";
import { summarySentence } from "../../Assets/Scripts/Core/Report";
import { toWorld, yawFromForward, NEAR_FIELD, FAR_FIELD, sideOf } from "../../Assets/Scripts/Core/PurnaTypes";
import { randomId, rng } from "../../Assets/Scripts/Core/Rng";

describe("summary sentence", () => {
  it("reads naturally for 0, 1 and several hints", () => {
    const e = new PurnaEngine();
    e.start(0);
    e.finish(1);
    const r = e.report("x", "s");
    expect(r.summary).toBe("Found 0 of 6 on the left and 0 of 6 on the right. No hints. Turned up to 0° left.");
    r.cues.hint1 = 1;
    expect(summarySentence(r)).toContain("1 hint.");
    r.cues.hint2 = 1;
    expect(summarySentence(r)).toContain("2 hints.");
  });
});

describe("coordinates", () => {
  it("yaw is positive when the head turns left, 0 straight ahead", () => {
    expect(yawFromForward(0, -1)).toBeCloseTo(0);
    expect(yawFromForward(-1, -1)).toBeCloseTo(45); // looking left-forward
    expect(yawFromForward(1, -1)).toBeCloseTo(-45);
  });

  it("field-relative points map to the table top and the upright board", () => {
    expect(toWorld(NEAR_FIELD, -10, 5)).toEqual({ x: -10, y: -30, z: -60 });
    expect(toWorld(FAR_FIELD, 20, 10)).toEqual({ x: 20, y: 10, z: -200 });
    expect(sideOf(-4, NEAR_FIELD)).toBe("L");
    expect(sideOf(2, NEAR_FIELD)).toBeNull();
    expect(sideOf(4, NEAR_FIELD)).toBe("R");
  });

  it("random ids have the requested length", () => {
    expect(randomId(rng(1), 6)).toHaveLength(6);
  });
});
