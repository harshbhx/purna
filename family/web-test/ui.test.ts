import { describe, expect, it } from "vitest";
import { el, fix, fmtWhen, message, pct } from "../public/assets/ui.js";

describe("el()", () => {
  it("puts text in as text, never as HTML", () => {
    const n = el("div", { text: '<img src=x onerror="alert(1)">' });
    expect(n.querySelector("img")).toBeNull();
    expect(n.textContent).toBe('<img src=x onerror="alert(1)">');
  });

  it("sets attributes, classes, listeners and children; skips false/null", () => {
    let clicked = 0;
    const n = el("button", { class: "ghost", type: "button", disabled: false, "aria-label": null, onclick: () => clicked++ }, "Go", el("span", { text: "!" }));
    expect(n.className).toBe("ghost");
    expect(n.getAttribute("type")).toBe("button");
    expect(n.hasAttribute("disabled")).toBe(false);
    expect(n.hasAttribute("aria-label")).toBe(false);
    expect(n.textContent).toBe("Go!");
    n.click();
    expect(clicked).toBe(1);
  });
});

describe("message()", () => {
  it("shows errors as alerts and successes as status, and clears", () => {
    const box = document.createElement("div");
    message(box, "Bad code");
    expect(box.querySelector('[role="alert"]')!.textContent).toBe("Bad code");
    message(box, "Saved", "ok");
    expect(box.querySelector('[role="status"]')!.textContent).toBe("Saved");
    message(box, "");
    expect(box.children).toHaveLength(0);
  });
});

describe("formatting", () => {
  it("says Today and Yesterday", () => {
    expect(fmtWhen(new Date().toISOString())).toMatch(/^Today, /);
    expect(fmtWhen(new Date(Date.now() - 86400000).toISOString())).toMatch(/^Yesterday, /);
  });

  it("formats percentages and fixed numbers, with a dash for missing", () => {
    expect(pct(0.834)).toBe("83%");
    expect(pct(null)).toBe("–");
    expect(fix(0.2149)).toBe("0.21");
    expect(fix(undefined)).toBe("–");
  });
});
