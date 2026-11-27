import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CAPTIONS, lightingOrder, NightTable } from "@/components/purna/night-table";
import { Replay } from "@/components/purna/replay";
import { SessionCard } from "@/components/purna/session-card";
import { SideBars } from "@/components/purna/side-bars";
import { TrendChart } from "@/components/purna/trend-chart";
import { toCard } from "@/lib/session";
import type { SessionJson } from "@/lib/types";
import demoJson from "../web/public/demo/sessions.json";
import { setReducedMotion } from "./setup";

const demo = demoJson as unknown as SessionJson[];
const healthy = demo.find((s) => s.near.leftHits === s.near.leftTotal && s.near.fpChipLeft === 0)!;
const neglect = demo.find((s) => s.near.leftHits < s.near.leftTotal)!;
const wholes = healthy.near.items.filter((i) => i.kind === "whole");
const litIds = (c: HTMLElement) => [...c.querySelectorAll(".nt-lamp.lit")].map((g) => Number(g.getAttribute("data-id")));

describe("NightTable", () => {
  afterEach(() => { vi.useRealTimers(); setReducedMotion(false); });

  it("lights the right half first, then the left after the hint, never a chipped diya", () => {
    vi.useFakeTimers();
    const { container } = render(<NightTable session={healthy} />);
    expect(litIds(container)).toHaveLength(0);
    const right = wholes.filter((i) => i.x > 0).map((i) => i.id);
    act(() => { vi.advanceTimersByTime(500 + 420 * right.length + 50); });
    expect(new Set(litIds(container))).toEqual(new Set(right));
    expect(screen.getByText(CAPTIONS.right)).toBeTruthy();
    act(() => { vi.advanceTimersByTime(1450); });
    expect(screen.getByText(CAPTIONS.hint)).toBeTruthy();
    expect(litIds(container)).toHaveLength(right.length);
    act(() => { vi.advanceTimersByTime(20_000); });
    expect(new Set(litIds(container))).toEqual(new Set(wholes.map((i) => i.id)));
    expect(container.querySelectorAll(".nt-chip.lit")).toHaveLength(0);
    expect(screen.getByText(CAPTIONS.whole)).toBeTruthy();
    // Play again starts over
    fireEvent.click(screen.getByRole("button", { name: "Play again" }));
    expect(litIds(container)).toHaveLength(0);
  });

  it("shows the whole table at once with reduced motion, and no Play again", () => {
    setReducedMotion(true);
    const { container } = render(<NightTable session={healthy} />);
    expect(litIds(container)).toHaveLength(wholes.length);
    expect(screen.getByText(CAPTIONS.whole)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Play again" })).toBeNull();
  });

  it("lights the left from the centre outward, the way a head turns", () => {
    const xs = lightingOrder(healthy.near.items).left.map((i) => i.x);
    expect(xs).toEqual([...xs].sort((a, b) => b - a));
  });
});

describe("Replay", () => {
  const n = neglect.near;
  it("draws found, missed and chipped diyas", () => {
    const { container } = render(<Replay session={neglect} animate={false} />);
    expect(container.querySelectorAll("circle.diya-lit")).toHaveLength(n.leftHits + n.rightHits);
    expect(container.querySelectorAll("circle.diya-dark")).toHaveLength(n.leftTotal - n.leftHits + n.rightTotal - n.rightHits);
    expect(container.querySelectorAll("path.diya-chip, path.diya-chip-lit")).toHaveLength(n.items.filter((i) => i.kind === "chipped").length);
  });
  it("numbers the finds 1..n along one thread, and describes itself", () => {
    const { container } = render(<Replay session={neglect} animate={false} />);
    const lit = n.events.filter((e) => e.r === "lit");
    expect([...container.querySelectorAll("text.order")].map((t) => t.textContent)).toEqual(lit.map((_, i) => String(i + 1)));
    expect(container.querySelector("polyline.thread")!.getAttribute("points")!.split(" ")).toHaveLength(lit.length);
    expect(container.querySelector("svg")!.getAttribute("aria-label")).toContain(`Missed: ${n.leftTotal - n.leftHits} on the left`);
  });
});

describe("TrendChart, SideBars and SessionCard", () => {
  it("draws two labelled lines with a point per session", () => {
    const pts = demo.map((s) => ({ date: s.startedAt, left: s.near.leftHits / s.near.leftTotal, right: s.near.rightHits / s.near.rightTotal }));
    const { container } = render(<TrendChart points={pts} />);
    expect(container.querySelectorAll("polyline")).toHaveLength(2);
    expect(container.querySelectorAll("circle")).toHaveLength(pts.length * 2);
    const labels = [...container.querySelectorAll("text.chart-label")].map((t) => t.textContent);
    expect(labels.some((l) => l!.startsWith("Left "))).toBe(true);
    expect(container.querySelector("svg")!.getAttribute("aria-label")).toMatch(/^Trend over 9 sessions/);
  });
  it("bars carry their numbers as text and an accessible label", () => {
    render(<SideBars leftHits={3} leftTotal={6} rightHits={6} rightTotal={6} />);
    expect(screen.getByRole("img", { name: "Left: 3 of 6 found" })).toBeTruthy();
    expect(screen.getByText("3/6")).toBeTruthy();
  });
  it("cards open on click and show a status word", () => {
    const onOpen = vi.fn();
    render(<SessionCard c={toCard(neglect)} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole("button", { name: /Open session from/ }));
    expect(onOpen).toHaveBeenCalledOnce();
    expect(screen.getByText(neglect.summary)).toBeTruthy();
    expect(screen.getByText(/hints?$/)).toBeTruthy();
  });
});
