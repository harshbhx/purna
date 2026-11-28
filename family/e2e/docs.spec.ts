// /docs in a real browser: reachable from the site, every page loads, prints cleanly, never scrolls sideways.
import { expect, test } from "@playwright/test";
import { watchConsole } from "./helpers";

const PAGES = ["overview", "safety", "setup", "carers", "therapists", "measures", "privacy", "terms", "accessibility", "evidence", "report"];

test("the footer's Safety link opens the safety page", async ({ page }) => {
  await page.goto("/");
  await page.locator("footer").getByRole("link", { name: "Safety", exact: true }).click();
  await expect(page).toHaveURL(/\/docs#safety$/);
  await expect(page.getByRole("heading", { level: 1, name: "Safety" })).toBeVisible();
  await expect(page.locator("#emergency")).toContainText("emergency number");
});

test("every page loads without errors and without sideways scroll on a small phone", async ({ page }) => {
  const problems = watchConsole(page);
  await page.setViewportSize({ width: 320, height: 720 });
  for (const id of PAGES) {
    await page.goto(`/docs#${id}`);
    await expect(page.locator("#doc-title")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), id).toBeLessThanOrEqual(0);
  }
  expect(problems).toEqual([]);
});

test("moving between pages updates the menu, the title and the page", async ({ page }) => {
  await page.goto("/docs");
  await expect(page.getByRole("heading", { level: 1, name: "Purna documentation" })).toBeVisible();
  const menu = page.getByRole("navigation", { name: "Documentation" });
  await menu.getByRole("link", { name: "Guide for therapists" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Guide for therapists" })).toBeVisible();
  await expect(page).toHaveTitle("Guide for therapists: Purna docs");
  await expect(menu.getByRole("link", { name: "Guide for therapists" })).toHaveAttribute("aria-current", "page");
  await page.getByRole("navigation", { name: "Previous and next page" }).getByRole("link", { name: /What the numbers mean/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "What the numbers mean" })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1, name: "Guide for therapists" })).toBeVisible();
});

test("printing keeps the page and drops the menus", async ({ page, isMobile }) => {
  test.skip(isMobile, "printing is a desktop task");
  await page.goto("/docs#carers");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("#doc-title")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Documentation" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Print this page" })).toBeHidden();
});
