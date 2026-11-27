import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CAPTIONS, nightTable } from "../public/assets/hero.js";
import demo from "../public/demo/sessions.json";

const session = demo.find((s) => s.near.leftHits === s.near.leftTotal && s.near.fpChipLeft === 0)!;
const wholes = session.near.items.filter((i) => i.kind === "whole");

describe("nightTable()", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("draws every diya from the session's layout, all dark to start", () => {
    const t = nightTable(session);
    expect(t.svg.querySelectorAll(".nt-lamp")).toHaveLength(session.near.items.length);
    expect(t.svg.querySelectorAll(".nt-chip")).toHaveLength(session.near.items.length - wholes.length);
    expect(t.svg.querySelectorAll(".nt-lamp.lit")).toHaveLength(0);
    expect(t.svg.getAttribute("role")).toBe("img");
  });

  it("lights the right half first, then the left after the hint, and never a chipped diya", () => {
    const t = nightTable(session);
    const captions: string[] = [];
    t.play((text) => captions.push(text));
    const lit = () => [...t.svg.querySelectorAll(".nt-lamp.lit")].map((g) => Number(g.getAttribute("data-id")));
    const rightIds = wholes.filter((i) => i.x > 0).map((i) => i.id);

    vi.advanceTimersByTime(500 + 420 * rightIds.length + 50);
    expect(new Set(lit())).toEqual(new Set(rightIds));
    expect(captions.at(-1)).toBe(CAPTIONS.right);

    vi.advanceTimersByTime(1400 + 50);
    expect(captions.at(-1)).toBe(CAPTIONS.hint);
    expect(lit()).toHaveLength(rightIds.length); // still waiting on the left

    vi.advanceTimersByTime(20_000);
    expect(new Set(lit())).toEqual(new Set(wholes.map((i) => i.id)));
    expect(t.svg.querySelectorAll(".nt-chip.lit")).toHaveLength(0);
    expect(captions.at(-1)).toBe(CAPTIONS.whole);
  });

  it("lights the left from the centre outward, the way a head turns", () => {
    const t = nightTable(session);
    const xs: number[] = t.order.left.map((id: number) => session.near.items.find((i) => i.id === id)!.x);
    expect(xs).toEqual([...xs].sort((a, b) => b - a));
    expect(xs.every((x) => x < 0)).toBe(true);
  });

  it("can be cancelled and replayed, and shows the final state at once for reduced motion", () => {
    const t = nightTable(session);
    const cancel = t.play();
    vi.advanceTimersByTime(1500);
    cancel();
    vi.advanceTimersByTime(30_000);
    expect(t.svg.querySelectorAll(".nt-lamp.lit").length).toBeLessThan(wholes.length);
    let done = false;
    t.showFinal((_, finished) => (done = finished));
    expect(t.svg.querySelectorAll(".nt-lamp.lit")).toHaveLength(wholes.length);
    expect(done).toBe(true);
  });
});
