// Accessibility: axe-core (WCAG 2.1 A and AA rules) on every screen, light and dark.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { pairFamily } from "./helpers";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function scan(page: Page, what: string, include?: string) {
  const builder = new AxeBuilder({ page }).withTags(TAGS);
  if (include) builder.include(include);
  const { violations } = await builder.analyze();
  const report = violations.map((v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join("\n  ")}`);
  expect(report, `${what}\n${report.join("\n")}`).toEqual([]);
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`${scheme} mode`, () => {
    test.use({ colorScheme: scheme, contextOptions: { reducedMotion: "reduce" } });

    test("the landing page", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await scan(page, "landing");
      const tab = page.getByRole("tab", { name: /each diya/ });
      await tab.click();
      await expect(tab).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tab", { selected: false }).first()).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await scan(page, "explainer, object-neglect tab", "#read");
    });

    test("the example dashboard and a session", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "See an example" }).first().click();
      await expect(page.getByRole("heading", { name: /Papa.s practice/ })).toBeVisible();
      await scan(page, "example dashboard");
      await page.locator("#latest .session-card").click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.getByRole("button", { name: /Details for the therapist/ }).click();
      await scan(page, "session dialog", "[role=dialog]");
    });

    test("a family's dashboard, its dialogs, and the therapist view", async ({ page, request, browser }) => {
      const key = await pairFamily(request, "Ba");
      await page.goto(`/join#k=${key}`);
      await expect(page.getByRole("heading", { name: /Ba.s practice/ })).toBeVisible();
      await scan(page, "family dashboard");

      await page.getByRole("button", { name: /Share with doctor/ }).click();
      await page.getByRole("button", { name: "Make a 7-day link" }).click();
      const link = (await page.locator("#share-new .linkbox").textContent())!;
      await scan(page, "share dialog", "[role=dialog]");
      await page.keyboard.press("Escape");

      for (const name of [/Invite family/, /Import from Logger/, /Delete everything/]) {
        await page.getByRole("button", { name }).click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await scan(page, `${name} dialog`, "[role=dialog]");
        await page.keyboard.press("Escape");
      }

      const ctx = await browser.newContext({ colorScheme: scheme, reducedMotion: "reduce" });
      const doctor = await ctx.newPage();
      await doctor.goto(new URL(link).pathname + new URL(link).hash);
      await expect(doctor.getByRole("heading", { name: "Ba: Purna practice" })).toBeVisible();
      await scan(doctor, "therapist view");
      await ctx.close();
    });

    test("the example therapist view, with its new charts and context card", async ({ page }) => {
      await page.goto("/doctor#demo");
      await expect(page.locator("#reference")).toBeVisible();
      await scan(page, "example therapist view");
    });

    test("the example dashboard in Hindi", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "See an example" }).first().click();
      await page.getByRole("button", { name: "Show this page in Hindi" }).click();
      await expect(page.getByRole("heading", { name: "Papa का अभ्यास" })).toBeVisible();
      await scan(page, "example dashboard in Hindi");
    });

    test("the error pages", async ({ page }) => {
      await page.goto("/doctor");
      await expect(page.getByRole("alert")).toBeVisible();
      await scan(page, "doctor link without a key");
      await page.goto("/join");
      await expect(page.locator("#out")).toBeVisible();
      await scan(page, "join without a key");
    });
  });
}
