// The landing explainer: one table, three simulated searchers.
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SEARCHERS, ThreeSearchers, verdict } from "@/components/purna/three-searchers";
import { setReducedMotion } from "./setup";

describe("Three searchers data", () => {
  it("is one layout played three times, so only the searching differs", () => {
    expect(SEARCHERS.map((s) => s.player)).toEqual(["healthy", "leftNeglect", "objectNeglect"]);
    const layouts = SEARCHERS.map((s) => JSON.stringify(s.session.near.items));
    expect(new Set(layouts).size).toBe(1);
    expect(new Set(SEARCHERS.map((s) => s.session.settings.seed)).size).toBe(1);
  });

  it("shows what each measure is for: the bench's three styles really separate", () => {
    const [h, l, o] = SEARCHERS.map((s) => s.session);
    expect(h.near.leftHits).toBe(h.near.leftTotal);
    expect(h.near.fpChipLeft + h.near.fpChipRight).toBe(0);
    expect(h.cues.hint1 + h.cues.hint2).toBe(0);
    expect(l.near.leftHits).toBeLessThan(l.near.leftTotal);
    expect(l.near.coc!).toBeGreaterThan(h.near.coc!);
    expect(l.head.maxLeftDeg).toBeLessThan(h.head.maxLeftDeg);
    expect(o.near.leftHits).toBe(o.near.leftTotal);
    expect(o.near.fpChipLeft).toBeGreaterThanOrEqual(2);
    expect(o.near.fpChipRight).toBe(0);
  });

  it("writes each verdict from the session's own numbers", () => {
    const [h, l, o] = SEARCHERS;
    expect(verdict(h.player, h.session).keys).toEqual([]);
    const lv = verdict(l.player, l.session);
    expect(lv.keys).toEqual(["sides", "centre", "order", "hints"]);
    expect(lv.text).toContain(`${l.session.near.leftTotal - l.session.near.leftHits} diyas missed on the left`);
    expect(lv.text).toContain(`${Math.round(l.session.head.maxLeftDeg)}° left`);
    const ov = verdict(o.player, o.session);
    expect(ov.keys).toEqual(["chipped"]);
    expect(ov.text).toContain(`${o.session.near.fpChipLeft} with the gap on the left were lit`);
  });
});

describe("ThreeSearchers", () => {
  beforeEach(() => setReducedMotion(true));
  afterEach(() => setReducedMotion(false));

  it("starts on the left-neglect searcher and marks the measures that give it away", () => {
    const { container } = render(<ThreeSearchers />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
    expect(tabs[1].getAttribute("aria-selected")).toBe("true");
    const hot = [...container.querySelectorAll("[data-hot]")].map((e) => e.getAttribute("data-measure"));
    expect(hot).toEqual(["sides", "centre", "order", "hints"]);
    expect(screen.getByRole("tabpanel").getAttribute("aria-labelledby")).toBe("tab-leftNeglect");
  });

  it("switches by click, and by arrow keys, Home and End like a real tab list", () => {
    const { container } = render(<ThreeSearchers />);
    const tabs = screen.getAllByRole("tab");
    fireEvent.click(tabs[2]);
    expect([...container.querySelectorAll("[data-hot]")].map((e) => e.getAttribute("data-measure"))).toEqual(["chipped"]);
    expect(within(screen.getByRole("tabpanel")).getByText(/6 left, 0 right|\d+ left, 0 right/)).toBeTruthy();

    fireEvent.keyDown(tabs[2], { key: "ArrowRight" });
    expect(tabs[0].getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(tabs[0]);
    expect(container.querySelectorAll("[data-hot]")).toHaveLength(0);

    fireEvent.keyDown(tabs[0], { key: "ArrowLeft" });
    expect(tabs[2].getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(tabs[2], { key: "Home" });
    expect(tabs[0].getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(tabs[0], { key: "End" });
    expect(tabs[2].getAttribute("aria-selected")).toBe("true");
    expect(tabs.filter((t) => t.tabIndex === 0)).toEqual([tabs[2]]);
  });

  it("announces the verdict and redraws the replay for the chosen searcher", () => {
    render(<ThreeSearchers />);
    const verdictEl = document.getElementById("three-verdict")!;
    expect(verdictEl.getAttribute("aria-live")).toBe("polite");
    fireEvent.click(screen.getAllByRole("tab")[0]);
    expect(verdictEl.textContent).toMatch(/Nothing stands out/);
    const img = screen.getByRole("img", { name: /Table seen from above/ });
    expect(img.getAttribute("aria-label")).toMatch(/Missed: 0 on the left, 0 on the right/);
  });
});
