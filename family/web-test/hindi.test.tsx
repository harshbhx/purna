// Hindi on the family's screens: the toggle, what it changes, what it keeps, and the sentences built from numbers.
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { App } from "@/App";
import { measuresIn, numbersOf, presetName, STRINGS, summaryOf } from "@/lib/i18n";
import type { SessionJson } from "@/lib/types";
import { Doctor } from "@/pages/Doctor";
import demoJson from "../web/public/demo/sessions.json";
import { setReducedMotion } from "./setup";
import { vi } from "vitest";

const demo = demoJson as unknown as SessionJson[];

describe("Hindi sentences", () => {
  it("builds the summary from the same numbers as Core's English sentence", () => {
    const s = demo[0];
    const n = numbersOf(s);
    expect(summaryOf(n, "en")).toBe(s.summary);
    const hi = summaryOf(n, "hi");
    expect(hi).toContain(`बाईं ओर ${s.near.leftTotal} में से ${s.near.leftHits}`);
    expect(hi).toContain(`दाईं ओर ${s.near.rightTotal} में से ${s.near.rightHits}`);
    expect(hi).toContain(`${Math.round(s.head.maxLeftDeg)}° तक मुड़े`);
    expect(summaryOf({ ...n, hints: 0 }, "hi")).toContain("कोई संकेत नहीं।");
    expect(summaryOf({ ...n, hints: 3 }, "hi")).toContain("3 संकेत।");
  });

  it("has every English string in Hindi too, and names the levels", () => {
    const missing = Object.keys(STRINGS.en).filter((k) => !(k in STRINGS.hi));
    expect(missing).toEqual([]);
    expect(presetName("standard", "hi")).toBe("सामान्य");
    expect(presetName("hard", "en")).toBe("Hard");
    const m = measuresIn(demo[0], "hi");
    expect(m.map((x) => x.label)).toEqual(["बायाँ बनाम दायाँ", "टूटे दीये", "खोजने का क्रम", "सिर का घुमाव"]);
  });
});

describe("The dashboard in Hindi", () => {
  beforeEach(() => { localStorage.clear(); setReducedMotion(true); history.replaceState(null, "", "/"); });
  afterEach(() => { setReducedMotion(false); localStorage.clear(); document.documentElement.lang = "en"; vi.unstubAllGlobals(); });

  async function example() {
    render(<App demo={demo} />);
    fireEvent.click(screen.getAllByRole("button", { name: "See an example" })[0]);
    return await screen.findByRole("heading", { name: "Papa’s practice" });
  }

  it("switches with one button, remembers the choice, and marks the page as Hindi", async () => {
    await example();
    const toggle = screen.getByRole("button", { name: "Show this page in Hindi" });
    expect(toggle.textContent).toContain("हिन्दी");
    fireEvent.click(toggle);
    expect(await screen.findByRole("heading", { name: "Papa का अभ्यास" })).toBeTruthy();
    expect(localStorage.getItem("purna.lang")).toBe("hi");
    expect(document.documentElement.lang).toBe("hi");
    expect(screen.getByText("सबसे नया सत्र")).toBeTruthy();
    expect(screen.getByText("पिछले सत्र")).toBeTruthy();
    const latest = document.querySelector("#latest .session-card")!;
    expect(latest.textContent).toMatch(/बाईं ओर \d+ में से \d+/);
    fireEvent.click(screen.getByRole("button", { name: "Show this page in English" }));
    expect(await screen.findByRole("heading", { name: "Papa’s practice" })).toBeTruthy();
    expect(localStorage.getItem("purna.lang")).toBe("en");
  });

  it("opens a session in Hindi: title, summary, replay legend, measures", async () => {
    localStorage.setItem("purna.lang", "hi");
    render(<App demo={demo} />);
    fireEvent.click(screen.getAllByRole("button", { name: "See an example" })[0]);
    await screen.findByRole("heading", { name: "Papa का अभ्यास" });
    fireEvent.click(document.querySelector("#latest .session-card")!);
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/^बाईं ओर \d+ में से/)).toBeTruthy();
    expect(within(dialog).getByText("अंक: मिलने का क्रम। धारीदार घेरा: छूटा हुआ।")).toBeTruthy();
    expect(within(dialog).getByText("बायाँ बनाम दायाँ")).toBeTruthy();
    expect(within(dialog).getByRole("button", { name: /फिर से चलाएँ/ })).toBeTruthy();
    expect(within(dialog).getByRole("img", { name: /^ऊपर से दिखती मेज़/ })).toBeTruthy();
    expect(within(dialog).getByText("← बायाँ")).toBeTruthy();
  });

  it("keeps the therapist view in English even when the family chose Hindi", async () => {
    localStorage.setItem("purna.lang", "hi");
    history.replaceState(null, "", "/doctor#demo");
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify(demoJson), { status: 200 }));
    render(<Doctor />);
    expect(await screen.findByRole("heading", { name: "Papa: Purna practice" })).toBeTruthy();
    expect(screen.getByText("Where the time went")).toBeTruthy();
  });
});
