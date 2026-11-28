// /docs: every page renders, links resolve, and the safety content that must never go missing stays.
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Docs, DOCS } from "@/pages/Docs";
import { GLOSSARY } from "@/data/glossary";

const show = (id: string) => { history.replaceState(null, "", `/docs#${id}`); return render(<Docs />); };

describe("Docs content", () => {
  it("has the pages a medical-adjacent product needs, each with a review date", () => {
    expect(DOCS.map((d) => d.id)).toEqual(["overview", "safety", "setup", "carers", "therapists", "measures", "results", "evidence", "glossary", "privacy", "terms", "accessibility", "report"]);
    for (const d of DOCS) expect(d.body, d.id).toMatch(/Last reviewed: \d{1,2} \w+ \d{4}\./);
  });

  it("links only to pages that exist, and only to https sites", () => {
    const ids = new Set(DOCS.map((d) => d.id));
    for (const d of DOCS) {
      for (const [, href] of d.body.matchAll(/\]\(([^)\s]+)\)/g)) {
        if (href.startsWith("#")) expect(ids.has(href.slice(1)), `${d.id} → ${href}`).toBe(true);
        else expect(href, `${d.id} → ${href}`).toMatch(/^(https:\/\/|mailto:harshbhx@gmail\.com$)/);
      }
    }
  });

  it("contains no raw HTML, so nothing is ever injected into the page", () => {
    for (const d of DOCS) expect(d.body, d.id).not.toMatch(/<\/?[a-z][^>]*>/i);
  });

  it("keeps the safety essentials: emergency numbers for several countries, the stroke signs, seizures, stop signs, no flames", () => {
    const s = DOCS.find((d) => d.id === "safety")!.body;
    for (const must of ["local emergency number", "911", "999", "112", "**B**alance", "**F**ace", "**A**rm", "**S**peech", "seizure", "Stop straight away", "No real lamps, candles or open flames", "three times a second", "18 and over"]) expect(s, must).toContain(must);
  });

  it("never claims regulatory approval, and says it isn't a medical device wherever it matters", () => {
    for (const id of ["overview", "safety", "terms"]) expect(DOCS.find((d) => d.id === id)!.body, id).toMatch(/not a medical device/i);
    for (const d of DOCS) expect(d.body, d.id).not.toMatch(/\b(is|are|has been) (FDA[- ])?(approved|cleared|certified)\b/i);
  });

  it("states retention periods that match the server's clean-up", () => {
    const p = DOCS.find((d) => d.id === "privacy")!.body;
    expect(p).toContain("30 days, then deleted automatically");
    expect(p).toContain("72 hours");
    expect(p).toMatch(/deleted 30 days after that/);
  });
});

describe("Docs page", () => {
  afterEach(() => { history.replaceState(null, "", "/"); });

  it("opens the page named in the hash, titles the tab, and marks it in the menu", () => {
    show("privacy");
    expect(screen.getByRole("heading", { level: 1, name: "Privacy" })).toBeTruthy();
    expect(document.title).toBe("Privacy: Purna docs");
    const menu = screen.getByRole("navigation", { name: "Documentation" });
    expect(within(menu).getByRole("link", { name: "Privacy" }).getAttribute("aria-current")).toBe("page");
    expect(within(menu).getAllByRole("link").filter((a) => a.getAttribute("aria-current") === "page")).toHaveLength(1);
  });

  it("falls back to the overview for an unknown or empty hash", () => {
    show("nope");
    expect(screen.getByRole("heading", { level: 1, name: "Purna documentation" })).toBeTruthy();
  });

  it("follows hash changes, with previous and next links", () => {
    show("safety");
    expect(within(screen.getByRole("navigation", { name: "Previous and next page" })).getByRole("link", { name: /Overview/ })).toBeTruthy();
    location.hash = "#setup";
    fireEvent(window, new HashChangeEvent("hashchange"));
    expect(screen.getByRole("heading", { level: 1, name: "Setting up the glasses" })).toBeTruthy();
    const pn = screen.getByRole("navigation", { name: "Previous and next page" });
    expect(pn.textContent).toContain("Safety");
    expect(pn.textContent).toContain("Guide for carers");
  });

  it("shows the emergency note on every page", () => {
    for (const d of DOCS) {
      const { unmount } = show(d.id);
      expect(document.getElementById("emergency")!.textContent).toMatch(/call your local emergency number now/);
      unmount();
    }
  });

  it("puts wide tables in a focusable, labelled scroll region", () => {
    show("safety");
    const region = document.querySelector("#doc-body [role=region]")!;
    expect(region.getAttribute("tabindex")).toBe("0");
    expect(region.getAttribute("aria-label")).toBeTruthy();
  });

  it("explains glossary words in the text, once per page, and lists every term on the glossary page", async () => {
    const { container, unmount } = show("therapists");
    const terms = [...container.querySelectorAll("a.term")];
    expect(terms.length).toBeGreaterThan(3);
    const slugs = terms.map((a) => a.getAttribute("href"));
    expect(new Set(slugs).size).toBe(slugs.length);
    const h = terms.find((a) => a.getAttribute("href") === "/docs#glossary/hemianopia")!;
    expect(h.getAttribute("href")).toBe("/docs#glossary/hemianopia");
    expect(document.getElementById(h.getAttribute("aria-describedby")!)!.textContent).toMatch(/half the field of vision/);
    fireEvent.focus(h);
    expect((await screen.findByRole("tooltip")).textContent).toMatch(/Hemianopia/);
    unmount();
    const g = show("glossary");
    expect(g.container.querySelectorAll("dl dt").length).toBe(GLOSSARY.length);
    expect(g.container.querySelector("#term-centre-of-cancellation")).toBeTruthy();
    expect(g.container.querySelectorAll("a.term")).toHaveLength(0);
  });
});