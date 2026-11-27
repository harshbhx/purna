import { describe, expect, it } from "vitest";
import { CueTracker, cueLevel } from "../../Assets/Scripts/Core/CueEngine";

describe("cueLevel", () => {
  it("follows the delay and needs a dark left diya", () => {
    expect(cueLevel(5.9, 1, 6)).toBe(0);
    expect(cueLevel(6, 1, 6)).toBe(1);
    expect(cueLevel(11.9, 1, 6)).toBe(1);
    expect(cueLevel(12, 1, 6)).toBe(2);
    expect(cueLevel(100, 0, 6)).toBe(0);
  });
});

function run(c: CueTracker, from: number, to: number, dark: number, step = 0.05): string[] {
  const out: string[] = [];
  const n = Math.round((to - from) / step);
  for (let i = 0; i <= n; i++) {
    const t = Math.round((from + i * step) * 1000) / 1000;
    const cue = c.update(t, dark);
    if (cue !== "none") out.push(cue + "@" + t.toFixed(2));
  }
  return out;
}

describe("CueTracker", () => {
  it("fires hint1 once at the delay and hint2 once at twice the delay, then stays quiet", () => {
    const c = new CueTracker(6, 3);
    c.startTask(0);
    const fired = run(c, 0, 30, 2);
    expect(fired).toEqual(["hint1@6.00", "hint2@12.00"]);
    expect(c.hint1Count).toBe(1);
    expect(c.hint2Count).toBe(1);
  });

  it("lighting a diya ends the spell and restarts the clock", () => {
    const c = new CueTracker(6, 3);
    c.startTask(0);
    run(c, 0, 7, 2);
    c.onLit(7, "R");
    expect(run(c, 7.05, 12.9, 2)).toEqual([]);
    expect(run(c, 13, 13.1, 2)).toEqual(["hint1@13.00"]);
  });

  it("never hints while every left whole diya is lit", () => {
    const c = new CueTracker(6, 3);
    c.startTask(0);
    expect(run(c, 0, 60, 0)).toEqual([]);
  });

  it("dims the beam after 4 un-hinted left finds and brightens on hint1, clamped", () => {
    const c = new CueTracker(6, 3);
    c.startTask(0);
    for (let i = 1; i <= 4; i++) c.onLit(i, "L");
    expect(c.beamLevel).toBe(2);
    for (let i = 5; i <= 16; i++) c.onLit(i, "L");
    expect(c.beamLevel).toBe(0);
    for (let i = 17; i <= 20; i++) c.onLit(i, "L");
    expect(c.beamLevel).toBe(0); // clamped at 0
    run(c, 20, 26.1, 1); // hint1 at 26
    expect(c.beamLevel).toBe(1);
    const full = new CueTracker(6, 3);
    full.startTask(0);
    run(full, 0, 6.1, 1);
    expect(full.beamLevel).toBe(3); // clamped at 3
  });

  it("right-side finds don't count toward dimming, and a hinted spell resets the streak", () => {
    const c = new CueTracker(2, 3);
    c.startTask(0);
    c.onLit(0.5, "L");
    c.onLit(1, "L");
    c.onLit(1.5, "R");
    c.onLit(1.8, "L");
    run(c, 1.8, 3.9, 1); // hint1 at 3.8: spell is hinted, beam stays 3 (clamped)
    c.onLit(4, "L"); // left find after a hint: streak resets
    c.onLit(4.5, "L");
    c.onLit(5, "L");
    c.onLit(5.5, "L");
    expect(c.beamLevel).toBe(3);
    c.onLit(6, "L"); // 4th un-hinted left find since the reset
    expect(c.beamLevel).toBe(2);
  });

  it("starts with the beam off when asked, and a new task starts a fresh spell", () => {
    const c = new CueTracker(6, 0);
    expect(c.beamLevel).toBe(0);
    c.startTask(0);
    run(c, 0, 6.1, 1);
    expect(c.hintedThisSpell).toBe(true);
    c.startTask(10);
    expect(c.hintedThisSpell).toBe(false);
  });
});
