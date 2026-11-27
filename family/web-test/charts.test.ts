import { describe, expect, it } from "vitest";
import { miniBars, replay, trendChart } from "../public/assets/charts.js";
import { measures, therapistRows } from "../public/assets/session-view.js";
import demo from "../public/demo/sessions.json";

const neglect = demo.find((s) => s.near.leftHits < s.near.leftTotal)!;

describe("replay()", () => {
  const svg = replay(neglect, { animate: false });

  it("draws every diya: whole ones as circles, chipped ones as open rings", () => {
    const whole = neglect.near.items.filter((i) => i.kind === "whole").length;
    const chipped = neglect.near.items.length - whole;
    expect(svg.querySelectorAll("circle.diya-lit, circle.diya-dark")).toHaveLength(whole);
    expect(svg.querySelectorAll("path.diya-chip, path.diya-chip-lit")).toHaveLength(chipped);
  });

  it("lights exactly the diyas found, and dashes the missed ones", () => {
    const n = neglect.near;
    expect(svg.querySelectorAll("circle.diya-lit")).toHaveLength(n.leftHits + n.rightHits);
    expect(svg.querySelectorAll("circle.diya-dark")).toHaveLength(n.leftTotal - n.leftHits + n.rightTotal - n.rightHits);
  });

  it("numbers the found diyas 1..n in the order they were lit, along one thread", () => {
    const lit = neglect.near.events.filter((e) => e.r === "lit");
    const labels = [...svg.querySelectorAll("text.order")].map((t) => t.textContent);
    expect(labels).toEqual(lit.map((_, i) => String(i + 1)));
    const pts = svg.querySelector("polyline.thread")!.getAttribute("points")!.split(" ");
    expect(pts).toHaveLength(lit.length);
    const first = neglect.near.items.find((i) => i.id === lit[0].id)!;
    expect(pts[0]).toBe(`${first.x},${first.u}`);
  });

  it("describes itself for screen readers", () => {
    const label = svg.getAttribute("aria-label")!;
    expect(svg.getAttribute("role")).toBe("img");
    expect(label).toContain(`Missed: ${neglect.near.leftTotal - neglect.near.leftHits} on the left`);
  });
});

describe("trendChart()", () => {
  const pts = demo.map((s) => ({ date: s.startedAt, left: s.near.leftHits / s.near.leftTotal, right: s.near.rightHits / s.near.rightTotal }));
  const svg = trendChart(pts, 360);

  it("draws two lines with a point per session, labelled in text (not colour only)", () => {
    expect(svg.querySelectorAll("polyline")).toHaveLength(2);
    expect(svg.querySelectorAll("circle")).toHaveLength(pts.length * 2);
    const labels = [...svg.querySelectorAll("text.chart-label")].map((t) => t.textContent);
    expect(labels.some((l) => l!.startsWith("Left "))).toBe(true);
    expect(labels.some((l) => l!.startsWith("Right "))).toBe(true);
  });

  it("sizes itself to the container and clamps silly widths", () => {
    expect(svg.getAttribute("viewBox")).toMatch(/^0 0 360 /);
    expect(trendChart(pts, 50).getAttribute("viewBox")).toMatch(/^0 0 300 /);
    expect(trendChart(pts, 5000).getAttribute("viewBox")).toMatch(/^0 0 900 /);
  });

  it("handles a single session", () => {
    const one = trendChart(pts.slice(0, 1));
    expect(one.querySelectorAll("polyline")).toHaveLength(0);
    expect(one.getAttribute("aria-label")).toMatch(/over 1 session:/);
  });
});

describe("miniBars() and session view", () => {
  it("bar widths match the share found", () => {
    const bars = miniBars({ leftHits: 3, leftTotal: 6, rightHits: 6, rightTotal: 6 });
    const fills = [...bars.querySelectorAll(".bar > i")] as HTMLElement[];
    expect(fills.map((f) => f.style.width)).toEqual(["50%", "100%"]);
    expect(bars.querySelector(".bar.l")!.getAttribute("aria-label")).toBe("Left: 3 of 6 found");
  });

  it("gives the four report tiles and the therapist numbers", () => {
    expect(measures(neglect).map((m) => m.querySelector("b")!.textContent)).toEqual(["Left vs right", "Chipped diyas", "Search order", "Head turn"]);
    const rows = Object.fromEntries(therapistRows(neglect));
    expect(rows["Centre of Cancellation"]).toBe(neglect.near.coc!.toFixed(2));
    expect(rows["Session id"]).toBe(neglect.sessionId);
    expect(rows["Far board found"]).toBeUndefined();
  });
});
