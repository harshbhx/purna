// Keyboard only: skip link, the explainer's tabs, the code form, and session dialogs that give focus back.
import { expect, test } from "@playwright/test";

test.use({ contextOptions: { reducedMotion: "reduce" } });

test("the first Tab offers Skip to content, and it lands in main", async ({ page, isMobile }) => {
  test.skip(isMobile, "no hardware keyboard on the phone project");
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
});

test("the explainer's tabs move with the arrow keys", async ({ page, isMobile }) => {
  test.skip(isMobile, "no hardware keyboard on the phone project");
  await page.goto("/#read");
  const tabs = page.getByRole("tab");
  await tabs.nth(1).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(2)).toBeFocused();
  await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#three-verdict")).toContainText("chipped diyas give it away");
  await page.keyboard.press("Home");
  await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#three-verdict")).toContainText("Nothing stands out");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("tabpanel")).toBeVisible();
});

test("the code form works from the keyboard and Enter submits", async ({ page, isMobile }) => {
  test.skip(isMobile, "no hardware keyboard on the phone project");
  await page.goto("/");
  await page.getByLabel("Code", { exact: true }).focus();
  await page.keyboard.type("DIYA-2222");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("What do you call them?")).toBeFocused();
  await page.keyboard.type("Papa");
  await page.keyboard.press("Enter");
  await expect(page.locator("#pair-msg [role=alert]")).toContainText(/code/i);
});

test("a session opens with Enter, closes with Escape, and focus goes back to its card", async ({ page, isMobile }) => {
  test.skip(isMobile, "no hardware keyboard on the phone project");
  await page.goto("/");
  await page.getByRole("button", { name: "See an example" }).first().click();
  const card = page.locator("#earlier .session-card").first();
  await card.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(":focus")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(card).toBeFocused();
});
