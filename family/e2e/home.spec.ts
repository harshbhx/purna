import { expect, test } from "@playwright/test";
import { sendDemoSessions, watchConsole } from "./helpers";

test("home explains Purna, plays the night table once, and ships a strict CSP", async ({ page }) => {
  const problems = watchConsole(page);
  const res = await page.goto("/");
  const csp = res!.headers()["content-security-policy"];
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("script-src 'self'");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Practice that makes the world whole again.");
  await expect(page.locator("#hero-table svg[role=img]")).toBeVisible();
  await expect(page.locator("#hero-table .nt-lamp")).toHaveCount(24);
  await expect(page.locator("#hero-caption")).toHaveText(/right side lights first/);
  await expect(page.locator("#hero-table .nt-lamp.lit")).toHaveCount(12, { timeout: 15_000 });
  await expect(page.locator("#hero-caption")).toHaveText("The head turns, and the table is whole.");
  await expect(page.getByRole("button", { name: "Play again" })).toBeVisible();
  await expect(page.getByText("A practice tool, not a medical device.", { exact: true })).toBeVisible();
  expect(problems).toEqual([]);
});

test("the landing shows a live replay, real previews, five steps, and never scrolls sideways", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#landing-replay svg text.order").first()).toHaveText("1");
  await expect(page.locator("#family-preview .session-card")).toContainText("Found");
  await expect(page.locator("#family-preview svg polyline")).toHaveCount(2);
  await expect(page.locator("#doctor-preview tbody tr")).toHaveCount(5);
  await expect(page.getByText(/^Step \d$/)).toHaveCount(5);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), `width ${width}`).toBe(0);
  }
});

test("every form field has a label", async ({ page }) => {
  await page.goto("/");
  const unlabelled = await page.$$eval("input, textarea", (els) =>
    els.filter((e) => !(e.id && document.querySelector(`label[for="${e.id}"]`))).map((e) => e.outerHTML));
  expect(unlabelled).toEqual([]);
});

test("with reduced motion the table is shown whole at once", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("#hero-table .nt-lamp.lit")).toHaveCount(12);
  await expect(page.locator("#hero-caption")).toHaveText("The head turns, and the table is whole.");
  await expect(page.getByRole("button", { name: "Play again" })).toBeHidden();
});

test("See an example opens a labelled demo dashboard and a session replay", async ({ page }) => {
  const problems = watchConsole(page);
  await page.goto("/");
  await page.getByRole("button", { name: "See an example" }).first().click();
  await expect(page.getByRole("heading", { name: /Papa.s practice/ })).toBeVisible();
  await expect(page.locator("#demo-badge")).toBeVisible();
  await expect(page.getByText(/simulated data/)).toBeVisible();
  await expect(page.locator("#dash .session-card")).toHaveCount(9);
  await expect(page.locator("#trend svg polyline")).toHaveCount(2);
  await expect(page.getByRole("button", { name: /Share with doctor/ })).toHaveCount(0);

  await page.locator("#latest .session-card").click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".measure")).toHaveCount(4);
  await expect(dialog.locator("#detail-replay svg")).toBeVisible();
  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(dialog).toBeHidden();
  expect(problems).toEqual([]);
});

test("a bad pairing code gets a plain answer", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Code", { exact: true }).fill("DIYA-2222");
  await page.getByLabel("What do you call them?").fill("Papa");
  await page.getByRole("button", { name: "See their practice" }).click();
  await expect(page.getByRole("alert")).toHaveText("We couldn't find that code. Check it on the glasses.");
});

test("the hero's buttons lead to the code form and the example", async ({ page }) => {
  await page.goto("/");
  await page.locator(".hero-actions").getByRole("link", { name: "I have a code" }).click();
  await expect(page.getByLabel("Code", { exact: true })).toBeInViewport();
  await page.locator("#pair").getByRole("button", { name: "See an example" }).click();
  await expect(page.getByRole("heading", { name: /Papa.s practice/ })).toBeInViewport();
});

test("after pairing, the dashboard opens at the top", async ({ page, request }) => {
  const code = await sendDemoSessions(request);
  await page.goto("/");
  await page.getByLabel("Code", { exact: true }).fill(code);
  await page.getByLabel("What do you call them?").fill("Papa");
  await page.getByRole("button", { name: "See their practice" }).click();
  await expect(page.getByRole("heading", { name: /Papa.s practice/ })).toBeInViewport();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test("on a phone the header folds into a menu", async ({ page, isMobile }) => {
  test.skip(!isMobile, "phone only");
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.getByRole("dialog");
  await expect(menu.getByRole("link", { name: "Research" })).toBeVisible();
  await menu.getByRole("link", { name: "How it works" }).click();
  await expect(menu).toBeHidden();
});
