// The therapist's next-session plan, the attention map on the replay, the theme switch and the browser table.
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Replay } from "@/components/purna/replay";
import { ThemeToggle, THEME_KEY } from "@/components/purna/theme-toggle";
import { Doctor } from "@/pages/Doctor";
import { Play, yawFor } from "@/pages/Play";
import type { SessionJson } from "@/lib/types";
import demoJson from "../web/public/demo/sessions.json";
import { setReducedMotion } from "./setup";

const demo = (demoJson as unknown as SessionJson[]).slice().sort((a, b) => b.startedAt.localeCompare(a.startedAt));
const TOKEN = "P".repeat(43);

describe("therapist plan in the doctor view", () => {
  beforeEach(() => { setReducedMotion(true); sessionStorage.clear(); history.replaceState(null, "", "/doctor#t=" + TOKEN); });
  afterEach(() => vi.unstubAllGlobals());

  it("posts the chosen level and delay, then says the glasses will load it", async () => {
    const calls: { url: string; init?: RequestInit }[] = [];
    vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
      calls.push({ url, init });
      if (url.endsWith("/doctor/plan")) {
        const b = JSON.parse(String(init!.body));
        return new Response(JSON.stringify({ plan: { ...b, setAt: "2026-12-03T10:00:00.000Z" } }), { status: 201 });
      }
      return new Response(JSON.stringify({ patient: { name: "Papa" }, expiresAt: new Date(Date.now() + 6 * 864e5).toISOString(), sessions: demo, notes: [], plan: null }), { status: 200 });
    });
    render(<Doctor />);
    const form = await waitFor(() => { const el = document.getElementById("plan-form"); if (!el) throw new Error("no form"); return el; });
    const f = within(form as HTMLElement);
    fireEvent.click(f.getByRole("radio", { name: "Easy" }));
    fireEvent.click(f.getByRole("radio", { name: "4 s" }));
    fireEvent.click(f.getByRole("button", { name: "Set next session" }));
    await screen.findByText(/Saved. The glasses will load Easy, hint after 4 s/);
    const post = calls.find((c) => c.url.endsWith("/doctor/plan"))!;
    expect(JSON.parse(String(post.init!.body))).toEqual({ preset: "easy", hintDelayS: 4 });
    expect((post.init!.headers as Record<string, string>).authorization).toBe("Bearer " + TOKEN);
    expect(document.getElementById("next-step")!.textContent).toMatch(/The glasses will load next: Set by you on 3 Dec: Easy, hint after 4 s/);
    expect(f.getByRole("button", { name: "Clear" })).toBeTruthy();
  });

  it("shows sessions played on /play as 'You' and never calls the API", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    sessionStorage.setItem("purna.played", JSON.stringify([demo[0]]));
    history.replaceState(null, "", "/doctor#played");
    render(<Doctor />);
    await screen.findByRole("heading", { name: "You: Purna practice" });
    expect(screen.getByText(/kept only in this browser tab/)).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe("attention map on the replay", () => {
  it("paints warm strips and says how much time was on the left", () => {
    const s = structuredClone(demo[0]);
    s.head.attention = [0.5, 0.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const { container } = render(<Replay session={s} animate={false} />);
    expect(container.querySelectorAll(".attention rect")).toHaveLength(14);
    expect(container.querySelector("svg")!.getAttribute("aria-label")).toMatch(/100% of the time on the left half/);
  });

  it("draws nothing for older sessions without a map, or when switched off", () => {
    const s = structuredClone(demo[0]);
    delete s.head.attention;
    const { container, rerender } = render(<Replay session={s} animate={false} />);
    expect(container.querySelector(".attention")).toBeNull();
    rerender(<Replay session={demo[0]} animate={false} attention={false} />);
    expect(container.querySelector(".attention")).toBeNull();
  });
});

describe("theme switch", () => {
  afterEach(() => { document.documentElement.removeAttribute("data-theme"); localStorage.clear(); });

  it("starts from the system, flips to dark and back, and remembers the choice", async () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem(THEME_KEY)).toBe("dark");
    fireEvent.click(await screen.findByRole("button", { name: "Switch to light mode" }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem(THEME_KEY)).toBe("light");
  });
});

describe("the table in the browser", () => {
  beforeEach(() => { sessionStorage.clear(); vi.stubGlobal("requestAnimationFrame", () => 0); vi.stubGlobal("cancelAnimationFrame", () => {}); });
  afterEach(() => vi.unstubAllGlobals());

  it("turns head position into yaw the same way the Lens does (positive = left)", () => {
    expect(yawFor(0)).toBe(0);
    expect(yawFor(-20)).toBeGreaterThan(16);
    expect(yawFor(20)).toBeLessThan(-16);
  });

  it("starts the real engine with only the diyas in view reachable, and finishing shows the report", async () => {
    render(<Play />);
    fireEvent.click(screen.getByRole("radio", { name: "Standard" }));
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Start" })); });
    const table = await screen.findByRole("application");
    const diyas = within(table).getAllByRole("button");
    expect(diyas).toHaveLength(24);
    const reachable = diyas.filter((d) => d.getAttribute("tabindex") === "0");
    expect(reachable.length).toBeGreaterThan(0);
    expect(reachable.length).toBeLessThan(24);

    fireEvent.keyDown(table, { key: "ArrowLeft" });
    expect(screen.getByText(/Head turned \d+° left/)).toBeTruthy();

    const whole = reachable.find((d) => d.getAttribute("aria-label") === "Whole diya");
    if (whole) { fireEvent.click(whole); expect(whole.getAttribute("aria-label")).toBe("Lit diya"); }

    fireEvent.click(screen.getByRole("button", { name: "Finish" }));
    await screen.findByRole("heading", { name: "Your search" });
    expect(screen.getByText("Left vs right")).toBeTruthy();
    const saved = JSON.parse(sessionStorage.getItem("purna.played")!);
    expect(saved).toHaveLength(1);
    expect(saved[0].schema).toBe("purna.session.v1");
    expect(saved[0].head.attention).toHaveLength(14);
    expect(screen.getByRole("link", { name: "See it as a therapist would" }).getAttribute("href")).toBe("/doctor#played");
  });
});
