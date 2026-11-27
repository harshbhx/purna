import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { sendDemoSessions, watchConsole } from "./helpers";

test("the whole family loop: pair, see, share with the doctor, get a note back, delete everything", async ({ page, browser, request }) => {
  const problems = watchConsole(page);
  const code = await sendDemoSessions(request);

  // Pair, typing the code loosely as a parent would.
  await page.goto("/");
  await page.getByLabel("Code").fill(code.toLowerCase().replace("-", " "));
  await page.getByLabel("What do you call them?").fill("Papa");
  await page.getByRole("button", { name: "See their practice" }).click();
  await expect(page.getByRole("heading", { name: "Papa's practice" })).toBeVisible();
  await expect(page.locator("#dash .session-card")).toHaveCount(9);
  await expect(page.locator("#demo-badge")).toBeHidden();

  // The key survives a reload; the session detail opens from a card.
  await page.reload();
  await expect(page.getByRole("heading", { name: "Papa's practice" })).toBeVisible();
  await page.locator("#earlier .session-card").first().click();
  await expect(page.getByRole("dialog").locator(".measure")).toHaveCount(4);
  await page.getByRole("button", { name: "Close" }).click();

  // Share with doctor.
  await page.getByRole("button", { name: "Share with doctor" }).click();
  await page.getByRole("button", { name: "Make a 7-day link" }).click();
  const link = (await page.locator("#share-new .linkbox").textContent())!;
  expect(link).toMatch(/\/doctor#t=[A-Za-z0-9_-]{43}$/);

  // The doctor opens it in a separate browser, logged out.
  const doctorCtx = await browser.newContext();
  const doctor = await doctorCtx.newPage();
  const doctorProblems = watchConsole(doctor, [/status of 410/]);
  await doctor.goto(new URL(link).pathname + new URL(link).hash);
  await expect(doctor.getByRole("heading", { name: "Papa: Purna practice" })).toBeVisible();
  expect(doctor.url()).not.toContain("#t=");
  await expect(doctor.locator("#table tbody tr")).toHaveCount(9);

  const download = doctor.waitForEvent("download");
  await doctor.getByRole("button", { name: "Download CSV" }).click();
  const csv = readFileSync(await (await download).path(), "utf8");
  expect(csv.split("\r\n").filter(Boolean)).toHaveLength(10);
  expect(csv.startsWith('"started_at","session_id"')).toBe(true);

  await doctor.getByLabel("Add a note for the family").fill("Good effort. Try hint delay 4 s next week.");
  await doctor.getByRole("button", { name: "Save note" }).click();
  await expect(doctor.getByRole("status")).toContainText("Saved");

  await page.reload();
  await expect(page.locator("#notes .note")).toContainText("Try hint delay 4 s next week.");

  // Invite link carries the key in the fragment only.
  await page.getByRole("button", { name: "Invite family" }).click();
  await expect(page.locator("#invite-link")).toHaveText(/\/join#k=[A-Za-z0-9_-]{43}$/);

  // Delete everything; the doctor link dies with it.
  await page.getByRole("button", { name: "Delete everything" }).first().click();
  await page.getByLabel('Type "Papa" to confirm').fill("papa");
  await page.locator("#delete-panel").getByRole("button", { name: "Delete everything" }).click();
  await expect(page.getByText("Everything is deleted.")).toBeVisible();
  await expect(page.locator("#landing")).toBeVisible();

  await doctor.reload();
  await expect(doctor.getByRole("alert")).toHaveText("This link has expired. Ask the family for a new one.");
  await doctorCtx.close();
  expect(problems).toEqual([]);
  expect(doctorProblems).toEqual([]);
});

test("an invite link signs a sibling in on another device", async ({ page, browser, request }) => {
  const code = await sendDemoSessions(request);
  const r = await request.post("/api/v1/pair", { data: { code, name: "Nani" } });
  const { familyKey } = await r.json();

  const sibling = await (await browser.newContext()).newPage();
  await sibling.goto("/join#k=" + familyKey);
  await expect(sibling.getByRole("heading", { name: "Nani's practice" })).toBeVisible();
  expect(sibling.url()).not.toContain("#k=");
});

test("importing a Logger line adds the session", async ({ page, request }) => {
  const code = await sendDemoSessions(request);
  const { familyKey } = await (await request.post("/api/v1/pair", { data: { code, name: "Papa" } })).json();
  await page.goto("/join#k=" + familyKey);
  await expect(page.locator("#dash .session-card")).toHaveCount(9);

  const one = JSON.parse(readFileSync(new URL("../samples/09-healthy.json", import.meta.url), "utf8"));
  one.sessionId = "s_logger_" + Date.now().toString(36);
  one.startedAt = new Date(Date.now() + 400 * 86400000).toISOString(); // newer than every demo session
  await page.getByRole("button", { name: "Import from Logger" }).click();
  await page.getByLabel("Session line").fill("12:01:03 PURNA_SESSION " + JSON.stringify(one));
  await page.getByRole("button", { name: "Import", exact: true }).click();
  await expect(page.locator("#import-msg")).toHaveText("Imported ✓");
  await expect(page.locator("#dash .session-card")).toHaveCount(10);
  await page.locator("#latest .session-card").click();
  await page.getByRole("dialog").getByText("Details for the therapist").click();
  await expect(page.getByRole("dialog")).toContainText(one.sessionId);
});
