import { expect, type APIRequestContext, type Page } from "@playwright/test";
import demo from "../public/demo/sessions.json" with { type: "json" };

export function deviceId(): string {
  return Array.from({ length: 32 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
}

/** Sends the demo sessions from one new pair of glasses; returns the pairing code. */
export async function sendDemoSessions(request: APIRequestContext): Promise<string> {
  const dev = deviceId();
  let code = "";
  for (const s of [...demo].sort((a, b) => a.startedAt.localeCompare(b.startedAt))) {
    const session = { ...s, sessionId: s.sessionId + "_" + dev.slice(0, 6) };
    const r = await request.post("/api/v1/sessions", { data: { deviceId: dev, session } });
    expect(r.status()).toBe(201);
    code = (await r.json()).pairCode ?? code;
  }
  expect(code).toMatch(/^DIYA-/);
  return code;
}

/** Fails the test on any console error or uncaught exception (CSP violations show up as console errors). */
export function watchConsole(page: Page, allow: RegExp[] = []): string[] {
  const problems: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error" && !allow.some((re) => re.test(m.text()))) problems.push(m.text());
  });
  page.on("pageerror", (e) => problems.push(String(e)));
  return problems;
}
