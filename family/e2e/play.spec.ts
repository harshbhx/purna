// /play: the diya table in the browser on the real engine, the therapist's next-session plan, and the theme switch.
import { expect, test, type Page } from "@playwright/test";
import { pairFamily, watchConsole } from "./helpers";

/** Turns the head with the arrow keys and lights every whole diya that comes into view. */
async function lightWhatYouSee(page: Page, keys: string[]) {
  const table = page.locator("#play-table");
  for (const k of keys) {
    if (!(await table.isVisible())) return true; // every whole diya lit: the table finished itself
    await table.focus();
    await page.keyboard.press(k);
    const dark = page.locator('#play-table [role=button][tabindex="0"][aria-label="Whole diya"]');
    while ((await table.isVisible()) && (await dark.count()) > 0) await dark.first().click({ timeout: 2000 }).catch(() => {});
  }
  return false;
}

test("play the table: narrow view, keyboard turns, pinches, report, replay and the therapist view", async ({ page }) => {
  const problems = watchConsole(page);
  await page.goto("/play");
  await expect(page.getByRole("heading", { level: 1, name: "Try the table yourself" })).toBeVisible();
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.locator("#play-table")).toBeFocused();

  // Only the diyas inside the view can be reached; the rest wait for a head turn.
  const all = await page.locator("#play-table [role=button]").count();
  expect(all).toBe(16); // Easy: 8 whole + 8 chipped
  const reachable = await page.locator('#play-table [role=button][tabindex="0"]').count();
  expect(reachable).toBeGreaterThan(0);
  expect(reachable).toBeLessThan(all);

  await page.keyboard.press("ArrowLeft");
  await expect(page.locator("#head-yaw")).toContainText("left");

  const lit = page.locator('#play-table [aria-label="Lit diya"]');
  await lightWhatYouSee(page, ["ArrowRight"]);
  expect(await lit.count()).toBeGreaterThan(0);
  // Sweep left then right: every whole diya comes into view and the table completes on its own.
  const completed = await lightWhatYouSee(page, [...Array(14).fill("ArrowLeft"), ...Array(14).fill("ArrowRight")]);
  if (!completed) await page.locator("#play-finish").click();
  await expect(page.getByRole("heading", { name: "Your search" })).toBeFocused();
  await expect(page.locator("#play-measures")).toContainText("Left vs right");
  await expect(page.locator("#play-replay svg")).toHaveAttribute("aria-label", /Warm light on the table shows where the head pointed/);
  await expect(page.locator("#play-replay .attention rect").first()).toBeAttached();

  await page.getByRole("link", { name: "See it as a therapist would" }).click();
  await expect(page.getByRole("heading", { name: "You: Purna practice" })).toBeVisible();
  await expect(page.locator("#demo-banner")).toContainText("Nothing was sent anywhere");
  expect(problems).toEqual([]);
});

test("feel neglect fades the left of the view, and the setup is keyboard-usable", async ({ page }) => {
  await page.goto("/play");
  await page.getByRole("radio", { name: "Standard" }).check();
  await page.getByLabel(/Feel neglect/).check();
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.locator("#play-table [role=button]")).toHaveCount(24);
  await expect(page.locator('#play-table rect[fill="url(#neglect-fade)"]')).toBeAttached();
  await page.locator("#play-finish").click();
  await expect(page.getByText(/With Feel neglect on/)).toBeVisible();
  await page.getByRole("button", { name: "Play again" }).click();
  await expect(page.getByRole("button", { name: "Start" })).toBeVisible();
});

test("the therapist sets the next session; the family sees it; the glasses get it once", async ({ page, request, browser }) => {
  const key = await pairFamily(request, "Nana");
  await page.goto(`/join#k=${key}`);
  await page.getByRole("button", { name: /Share with doctor/ }).click();
  await page.getByRole("button", { name: "Make a 7-day link" }).click();
  const link = new URL((await page.locator("#share-new .linkbox").textContent())!);
  await page.keyboard.press("Escape");

  const ctx = await browser.newContext();
  const doctor = await ctx.newPage();
  await doctor.goto(link.pathname + link.hash);
  const form = doctor.locator("#plan-form");
  await form.getByRole("radio", { name: "Easy" }).check();
  await form.getByRole("radio", { name: "4 s" }).check();
  await form.getByRole("button", { name: "Set next session" }).click();
  await expect(form).toContainText("Saved. The glasses will load Easy, hint after 4 s");
  await expect(doctor.locator("#next-step")).toContainText("The glasses will load next: Set by you");
  await ctx.close();

  await page.reload();
  await expect(page.locator("#plan-note")).toContainText("Easy, hint after 4 s");

  // The doctor clears it from the same link.
  const ctx2 = await browser.newContext();
  const d2 = await ctx2.newPage();
  await d2.goto(link.pathname + link.hash);
  await d2.locator("#plan-form").getByRole("button", { name: "Clear" }).click();
  await expect(d2.locator("#plan-form")).toContainText("Cleared");
  await ctx2.close();
  await page.reload();
  await expect(page.locator("#plan-note")).toHaveCount(0);
});

test("the example therapist view lets you try setting a plan without saving", async ({ page }) => {
  await page.goto("/doctor#demo");
  const form = page.locator("#plan-form");
  await form.getByRole("radio", { name: "Hard" }).check();
  await form.getByRole("button", { name: "Set next session" }).click();
  await expect(form).toContainText("Example only, not saved");
});

test("the theme switch flips light and dark, and remembers it on every page", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/docs");
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const light = await bg();
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await bg()).not.toBe(light);
  await page.goto("/play");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: "Switch to light mode" })).toBeVisible();
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await bg()).toBe(light);
});
