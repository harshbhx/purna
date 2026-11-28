// The therapist's link from the doctor's side: lifetime, stopping it, printing, bad links.
import { expect, test } from "@playwright/test";
import { pairFamily, watchConsole } from "./helpers";

test("stopping a link ends it at once for the doctor", async ({ page, browser, request }) => {
  const key = await pairFamily(request, "Dada");
  await page.goto(`/join#k=${key}`);
  await page.getByRole("button", { name: /Share with doctor/ }).click();
  await page.getByRole("button", { name: "Make a 7-day link" }).click();
  const link = (await page.locator("#share-new .linkbox").textContent())!;

  const ctx = await browser.newContext();
  const doctor = await ctx.newPage();
  const problems = watchConsole(doctor, [/status of 410/]);
  await doctor.goto(new URL(link).pathname + new URL(link).hash);
  await expect(doctor.getByRole("heading", { name: "Dada: Purna practice" })).toBeVisible();
  // The link is valid for 7 days, and the page says so.
  await expect(doctor.getByText(/This link works until/)).toBeVisible();

  await page.getByRole("button", { name: "Stop sharing" }).click();
  await expect(page.getByText("Stopped. That link no longer works.")).toBeVisible();

  await doctor.reload();
  await expect(doctor.getByRole("alert")).toHaveText("This link has expired. Ask the family for a new one.");
  await expect(doctor.locator("#table")).toHaveCount(0);
  expect(problems).toEqual([]);
  await ctx.close();
});

test("the print layout drops the buttons and opens every replay", async ({ page, request, isMobile }) => {
  test.skip(isMobile, "printing is a desktop task");
  const key = await pairFamily(request, "Mummy");
  const r = await request.post("/api/v1/me/shares", { headers: { authorization: `Bearer ${key}` }, data: { days: 7 } });
  const { token } = await r.json();
  await page.goto(`/doctor#t=${token}`);
  await expect(page.getByRole("heading", { name: "Mummy: Purna practice" })).toBeVisible();
  await page.evaluate(() => { window.print = () => {}; });
  await page.getByRole("button", { name: "Print" }).click();
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".no-print").first()).toBeHidden();
  await expect(page.getByRole("button", { name: "Download CSV" })).toBeHidden();
  await expect(page.locator("#table tbody tr")).toHaveCount(9);
  await expect(page.locator("[role=img][aria-label^='Table seen from above']")).toHaveCount(9);
});

test("a link with a made-up token says so in plain words", async ({ page }) => {
  const problems = watchConsole(page, [/status of 4\d\d/]);
  await page.goto("/doctor#t=" + "x".repeat(43));
  await expect(page.getByRole("alert")).toContainText(/link/i);
  expect(page.url()).not.toContain("#t=");
  expect(problems).toEqual([]);
});

test("an old invite link sends the family home with a reason, not an error", async ({ page }) => {
  const problems = watchConsole(page, [/status of 401/]);
  await page.goto("/join#k=" + "y".repeat(43));
  await expect(page.getByText(/isn't valid any more/)).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Practice that makes the world whole again.");
  expect(problems).toEqual([]);
});
