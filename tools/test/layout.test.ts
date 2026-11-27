import { describe, expect, it } from "vitest";
import { generateLayout, planSlots } from "../../Assets/Scripts/Core/Layout";
import { FAR_FIELD, FAR_GAP_CM, FAR_SIZE_CM, Field, Item, NEAR_FIELD, PRESETS, Preset, usableU, usableX } from "../../Assets/Scripts/Core/PurnaTypes";

const presets: Preset[] = ["easy", "standard", "hard"];

function check(field: Field, items: Item[], whole: number, chipped: number, gap: number): void {
  expect(items.length).toBe(whole + chipped);
  const ux = usableX(field);
  const uu = usableU(field);
  const by = (side: string, kind: string, chip?: string) =>
    items.filter((i) => i.side === side && i.kind === kind && (chip === undefined || i.chip === chip)).length;
  expect(by("L", "whole")).toBe(whole / 2);
  expect(by("R", "whole")).toBe(whole / 2);
  expect(by("L", "chipped")).toBe(chipped / 2);
  expect(by("R", "chipped")).toBe(chipped / 2);
  // gap sides: equal totals, and within each side as even as possible
  const gapL = items.filter((i) => i.chip === "L").length;
  const gapR = items.filter((i) => i.chip === "R").length;
  expect(gapL).toBe(gapR);
  for (const side of ["L", "R"]) expect(Math.abs(by(side, "chipped", "L") - by(side, "chipped", "R"))).toBeLessThanOrEqual(1);
  for (const it of items) {
    expect(Math.abs(it.x)).toBeGreaterThanOrEqual(field.bandCm);
    expect(it.x).toBeGreaterThanOrEqual(ux.min);
    expect(it.x).toBeLessThanOrEqual(ux.max);
    expect(it.u).toBeGreaterThanOrEqual(uu.min);
    expect(it.u).toBeLessThanOrEqual(uu.max);
    expect(it.side === "L" ? it.x < 0 : it.x > 0).toBe(true);
    expect(it.kind === "whole" ? it.chip === null : it.chip !== null).toBe(true);
  }
  for (let i = 0; i < items.length; i++)
    for (let j = i + 1; j < items.length; j++)
      expect(Math.hypot(items[i].x - items[j].x, items[i].u - items[j].u)).toBeGreaterThanOrEqual(gap - 1e-9);
  // ids are 0..n-1, each once
  expect(items.map((i) => i.id).sort((a, b) => a - b)).toEqual(items.map((_, i) => i));
}

describe("table layout", () => {
  for (const p of presets) {
    it(`${p}: every rule holds for seeds 1-500`, () => {
      const spec = PRESETS[p];
      for (let seed = 1; seed <= 500; seed++) {
        const items = generateLayout(NEAR_FIELD, spec.near, spec.near, seed, spec.nearSizeCm, spec.nearGapCm);
        check(NEAR_FIELD, items, spec.near, spec.near, spec.nearGapCm);
      }
    });
  }
});

describe("far board layout", () => {
  for (const p of presets) {
    it(`${p}: every rule holds for seeds 1-200`, () => {
      const spec = PRESETS[p];
      for (let seed = 1; seed <= 200; seed++) {
        const items = generateLayout(FAR_FIELD, spec.far, spec.far, seed, FAR_SIZE_CM, FAR_GAP_CM);
        check(FAR_FIELD, items, spec.far, spec.far, FAR_GAP_CM);
      }
    });
  }
});

describe("determinism", () => {
  it("same seed gives the same layout, different seeds differ", () => {
    const a = generateLayout(NEAR_FIELD, 12, 12, 4127, 6, 8);
    const b = generateLayout(NEAR_FIELD, 12, 12, 4127, 6, 8);
    const c = generateLayout(NEAR_FIELD, 12, 12, 4128, 6, 8);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it("rejects odd counts and impossible fields", () => {
    expect(() => planSlots(3, 2)).toThrow();
    expect(() => generateLayout(NEAR_FIELD, 40, 40, 1, 6, 12)).toThrow(/too crowded/);
  });
});
