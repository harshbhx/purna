// The therapist's extra views: the day-to-day band, where the time went, and context from published tests.
import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LookChart } from "@/components/purna/look-chart";
import { ReferenceCard } from "@/components/purna/reference-card";
import { TrendChart } from "@/components/purna/trend-chart";
import { COC_REFERENCE, dayToDay, lookStats } from "@/lib/session";
import type { SessionJson } from "@/lib/types";
import { Doctor } from "@/pages/Doctor";
import demoJson from "../web/public/demo/sessions.json";
import { setReducedMotion } from "./setup";

const demo = (demoJson as unknown as SessionJson[]).slice().sort((a, b) => b.startedAt.localeCompare(a.startedAt));

describe("dayToDay", () => {
  it("needs four sessions with left diyas", () => {
    expect(dayToDay([0.5, 0.6, 0.7])).toBeNull();
    expect(dayToDay([0.5, null, 0.6, null, 0.7])).toBeNull();
  });

  it("uses the median session-to-session change, so one lucky day doesn't widen the band", () => {
    // changes: 0.1, 0.1, 0.5, 0.1 → median 0.1
    expect(dayToDay([0.3, 0.4, 0.5, 1.0, 0.9])!.spread).toBeCloseTo(0.1, 10);
    // changes: 0.1, 0.2 , 0.3 → median 0.2 (odd count)
    expect(dayToDay([0.1, 0.2, 0.4, 0.7])!.spread).toBeCloseTo(0.2, 10);
  });

  it("centres the band on a rolling mean of up to three sessions, keeping gaps as gaps", () => {
    const b = dayToDay([0.3, 0.6, null, 0.9, 0.6])!;
    expect(b.centre[0]).toBeCloseTo(0.3);
    expect(b.centre[1]).toBeCloseTo(0.45);
    expect(b.centre[2]).toBeNull();
    expect(b.centre[3]).toBeCloseTo(0.75);
    expect(b.centre[4]).toBeCloseTo(0.75);
  });

  it("draws as a shaded polygon on the trend, only when given", () => {
    const pts = demo.slice().reverse().map((s) => ({ date: s.startedAt, left: s.near.leftHits / s.near.leftTotal, right: s.near.rightHits / s.near.rightTotal }));
    const { container, rerender } = render(<TrendChart points={pts} />);
    expect(container.querySelector("[data-band]")).toBeNull();
    rerender(<TrendChart points={pts} band={dayToDay(pts.map((p) => p.left))} />);
    expect(container.querySelector("[data-band]")!.getAttribute("points")!.split(" ")).toHaveLength(pts.length * 2);
  });
});

describe("lookStats and LookChart", () => {
  it("compares the earliest and most recent sessions, three each at most", () => {
    const st = lookStats(demo)!;
    expect(st.k).toBe(3);
    const mean = (ss: SessionJson[], c: number) => ss.reduce((a, s) => a + (s.near.timeByColumnS[c] ?? 0), 0) / ss.length;
    expect(st.recent.cols[2]).toBeCloseTo(mean(demo.slice(0, 3), 2));
    expect(st.earlier!.timeLeft).toBeCloseTo(demo.slice(-3).reduce((a, s) => a + s.head.pctTimeLeft, 0) / 3);
  });

  it("ignores thirds with nothing found, and a single session has no 'earlier'", () => {
    const one = { ...demo[0], near: { ...demo[0].near, timeByColumnS: [null, 2, 3] } } as SessionJson;
    const st = lookStats([one])!;
    expect(st.earlier).toBeNull();
    expect(st.recent.cols).toEqual([null, 2, 3]);
    expect(lookStats([])).toBeNull();
  });

  it("writes every value as text, including thirds where nothing was found", () => {
    const one = { ...demo[0], near: { ...demo[0].near, timeByColumnS: [null, 2, 3] } } as SessionJson;
    render(<LookChart sessions={[one]} />);
    const fig = screen.getByRole("img");
    expect(fig.getAttribute("aria-label")).toMatch(/Left third none found, Centre 2.0 s, Right third 3.0 s/);
    expect(within(fig).getByText(/Latest session: head turned left/)).toBeTruthy();
  });
});

describe("ReferenceCard", () => {
  it("shows the published Bells Test reference as context, with its source, never as a verdict", () => {
    render(<ReferenceCard latestCoc={0.21} earlierCoc={0.4} />);
    expect(COC_REFERENCE).toBe(0.081);
    expect(screen.getByRole("img").getAttribute("aria-label")).toMatch(/Latest 0.21, earlier 0.40\. Dashed line at 0.081/);
    expect(screen.getByText(/Rorden & Karnath, 2010/)).toBeTruthy();
    expect(screen.getByText(/Bickerton et al., 2011/)).toBeTruthy();
    expect(screen.getByText(/use a standard assessment to diagnose/)).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/\bneglect detected\b|\bhas neglect\b|\bdiagnosed\b/i);
  });
});

describe("Doctor view with the new cards", () => {
  beforeEach(() => { setReducedMotion(true); sessionStorage.clear(); history.replaceState(null, "", "/doctor#t=" + "T".repeat(43)); });
  afterEach(() => { vi.unstubAllGlobals(); setReducedMotion(false); });

  it("shows the band note with the person's name, where the time went, and the context card", async () => {
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify({ patient: { name: "Papa" }, expiresAt: new Date(Date.now() + 6 * 864e5).toISOString(), sessions: demo, notes: [] }), { status: 200 }));
    render(<Doctor />);
    await screen.findByRole("heading", { name: "Papa: Purna practice" });
    expect(document.getElementById("band-note")!.textContent).toMatch(/^Shaded: Papa’s usual change from one session to the next \(±\d+ points\)/);
    expect(document.querySelector("#look [role=img]")).toBeTruthy();
    expect(document.getElementById("reference")).toBeTruthy();
    expect(document.getElementById("next-step")!.textContent).toMatch(/^The glasses will suggest next: /);
  });
});

describe("Example therapist view (/doctor#demo)", () => {
  beforeEach(() => { setReducedMotion(true); sessionStorage.clear(); history.replaceState(null, "", "/doctor#demo"); });
  afterEach(() => { vi.unstubAllGlobals(); setReducedMotion(false); });

  it("loads the labelled demo sessions without any key, says it's an example, and turns notes off", async () => {
    const calls: string[] = [];
    vi.stubGlobal("fetch", async (url: string) => { calls.push(url); return new Response(JSON.stringify(demoJson), { status: 200 }); });
    render(<Doctor />);
    await screen.findByRole("heading", { name: "Papa: Purna practice" });
    expect(calls).toEqual(["/demo/sessions.json"]);
    expect(document.getElementById("demo-banner")!.textContent).toMatch(/simulated sessions .* not a real person/);
    expect(document.querySelectorAll("#table tbody tr")).toHaveLength(demo.length);
    expect(document.getElementById("note-form")).toBeNull();
    expect(screen.getByText(/Example note:/)).toBeTruthy();
  });
});
