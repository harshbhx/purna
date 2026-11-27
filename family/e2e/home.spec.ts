import { expect, test } from "@playwright/test";
import { sendDemoSessions, watchConsole } from "./helpers";

test("home explains Purna, shows a live replay and ships a strict CSP", async ({ page }) => {
  const problems = watchConsole(page);
  const res = await page.goto("/");
  expect(res!.headers()["content-security-policy"]).toContain("default-src 'self'");
  expect(res!.headers()["content-security-policy"]).toContain("script-src 'self'");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Practice that makes the world whole again.");
  await expect(page.locator("#hero-replay svg[role=img]")).toBeVisible();
  await expect(page.locator("#hero-replay text.order").first()).toHaveText("1");
  await expect(page.getByText("not a medical device")).toBeVisible();
  expect(problems).toEqual([]);
});

test("every form field has a label", async ({ page }) => {
  await page.goto("/");
  const unlabelled = await page.$$eval("input, textarea", (els) =>
    els.filter((e) => !(e.id && document.querySelector(`label[for="${e.id}"]`))).map((e) => e.outerHTML));
  expect(unlabelled).toEqual([]);
});

test("See an example opens a labelled demo dashboard and a session replay", async ({ page }) => {
  const problems = watchConsole(page);
  await page.goto("/");
  await page.getByRole("button", { name: "See an example" }).click();
  await expect(page.getByRole("heading", { name: /Papa's practice/ })).toBeVisible();
  await expect(page.locator("#demo-badge")).toBeVisible();
  await expect(page.getByText("simulated data")).toBeVisible();
  await expect(page.locator(".session-card")).toHaveCount(9);
  await expect(page.locator("#trend svg polyline")).toHaveCount(2);
  await expect(page.locator("#tools")).toBeHidden();

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
  await page.getByLabel("Code").fill("DIYA-2222");
  await page.getByLabel("What do you call them?").fill("Papa");
  await page.getByRole("button", { name: "See their practice" }).click();
  await expect(page.getByRole("alert")).toHaveText("We couldn't find that code. Check it on the glasses.");
});

test("after pairing, the dashboard opens at the top", async ({ page, request }) => {
  const code = await sendDemoSessions(request);
  await page.goto("/");
  await page.getByLabel("Code").fill(code);
  await page.getByLabel("What do you call them?").fill("Papa");
  await page.getByRole("button", { name: "See their practice" }).click();
  await expect(page.getByRole("heading", { name: "Papa's practice" })).toBeInViewport();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});
