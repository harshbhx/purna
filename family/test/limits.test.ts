// Rate limits on the routes anyone can reach: pairing (per caller IP), sessions (per glasses), doctor notes (per link).
// Each test uses its own IP, device or link, because the limiter's counters last the whole minute.
import { describe, expect, it } from "vitest";
import { call, deviceId, paired, session } from "./helpers";

const ip = () => `198.51.100.${Math.floor(Math.random() * 250) + 1}`;

async function expectSlowDown(r: Response) {
  expect(r.status).toBe(429);
  expect(r.headers.get("retry-after")).toBe("60");
  expect(await r.json()).toEqual({ error: { code: "slow_down", message: "Too many tries in a short time. Wait a minute and try again." } });
}

describe("Pairing limit", () => {
  it("allows 10 tries a minute from one IP, then slows that IP down, and only that IP", async () => {
    const a = ip();
    let b = ip();
    while (b === a) b = ip();
    for (let i = 0; i < 10; i++) {
      const r = await call("/api/v1/pair", { body: { code: "DIYA-2222", name: "Papa" }, headers: { "cf-connecting-ip": a } });
      expect(r.status).toBe(404);
    }
    await expectSlowDown(await call("/api/v1/pair", { body: { code: "DIYA-2222", name: "Papa" }, headers: { "cf-connecting-ip": a } }));
    const other = await call("/api/v1/pair", { body: { code: "DIYA-2222", name: "Papa" }, headers: { "cf-connecting-ip": b } });
    expect(other.status).toBe(404);
  });

  it("checks the limit before reading the body, so a flood of junk is slowed down too", async () => {
    const a = ip();
    for (let i = 0; i < 10; i++) await call("/api/v1/pair", { raw: "not json", headers: { "cf-connecting-ip": a } });
    await expectSlowDown(await call("/api/v1/pair", { raw: "not json", headers: { "cf-connecting-ip": a } }));
  });

  it("a slowed-down IP can't pair even with a real code, and the code still works from elsewhere", async () => {
    const a = ip();
    for (let i = 0; i < 10; i++) await call("/api/v1/pair", { body: { code: "DIYA-2222", name: "Papa" }, headers: { "cf-connecting-ip": a } });
    const dev = deviceId();
    const sent = await call("/api/v1/sessions", { body: { deviceId: dev, session: session() } });
    const { pairCode } = (await sent.json()) as { pairCode: string };
    await expectSlowDown(await call("/api/v1/pair", { body: { code: pairCode, name: "Papa" }, headers: { "cf-connecting-ip": a } }));
    const ok = await call("/api/v1/pair", { body: { code: pairCode, name: "Papa" }, headers: { "cf-connecting-ip": "203.0.113.9" } });
    expect(ok.status).toBe(200);
  });
});

describe("Session limit", () => {
  it("takes 20 sessions a minute from one pair of glasses, then answers 429 with CORS, and other glasses are unaffected", async () => {
    const dev = deviceId();
    for (let i = 0; i < 20; i++) {
      const r = await call("/api/v1/sessions", { body: { deviceId: dev, session: session() } });
      expect(r.status).toBe(201);
    }
    const r = await call("/api/v1/sessions", { body: { deviceId: dev, session: session() } });
    expect(r.headers.get("access-control-allow-origin")).toBe("*");
    await expectSlowDown(r);
    const other = await call("/api/v1/sessions", { body: { deviceId: deviceId(), session: session() } });
    expect(other.status).toBe(201);
  });
});

describe("Doctor note limit", () => {
  async function share(key: string) {
    const r = await call("/api/v1/me/shares", { body: { days: 7 }, auth: key });
    return ((await r.json()) as { token: string }).token;
  }

  it("takes 10 notes a minute per link, then 429, and a second link is unaffected", async () => {
    const { key } = await paired("Ba");
    const t1 = await share(key);
    const t2 = await share(key);
    for (let i = 0; i < 10; i++) {
      const r = await call("/api/v1/doctor/notes", { body: { text: `Note ${i}` }, auth: t1 });
      expect(r.status).toBe(201);
    }
    await expectSlowDown(await call("/api/v1/doctor/notes", { body: { text: "One more" }, auth: t1 }));
    expect((await call("/api/v1/doctor/notes", { body: { text: "From the other link" }, auth: t2 })).status).toBe(201);
    const me = (await (await call("/api/v1/me", { auth: key })).json()) as { notes: unknown[] };
    expect(me.notes).toHaveLength(11);
  });

  it("a link that doesn't exist is refused as expired, before anything is counted", async () => {
    const r = await call("/api/v1/doctor/notes", { body: { text: "hi" }, auth: "z".repeat(43) });
    expect(r.status).toBe(410);
  });
});
