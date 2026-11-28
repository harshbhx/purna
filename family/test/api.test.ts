// Purna Family API against the real Worker and a local D1 (docs/06-TESTING.md §3).

import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import { normalizePairCode, PAIR_ALPHABET, newPairCode } from "../src/lib/crypto";
import { call, deviceId, paired, session } from "./helpers";

type J = Record<string, any>;
const body = async (r: Response) => (await r.json()) as J;

describe("health and routing", () => {
  it("answers /health", async () => {
    const r = await call("/api/v1/health");
    expect(r.status).toBe(200);
    expect(await body(r)).toMatchObject({ ok: true });
  });

  it("404s unknown API routes with a JSON error", async () => {
    const r = await call("/api/v1/nope");
    expect(r.status).toBe(404);
    expect((await body(r)).error.code).toBe("no_route");
  });
});

describe("POST /sessions (from the Lens)", () => {
  it("stores an unlinked session and returns a DIYA code valid 72 h, with CORS", async () => {
    const r = await call("/api/v1/sessions", { body: { deviceId: deviceId(), session: session() } });
    expect(r.status).toBe(201);
    expect(r.headers.get("access-control-allow-origin")).toBe("*");
    const b = await body(r);
    expect(b.linked).toBe(false);
    expect(b.pairCode).toMatch(/^DIYA-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/);
    const hours = (Date.parse(b.pairExpiresAt) - Date.now()) / 3600000;
    expect(hours).toBeGreaterThan(71.9);
    expect(hours).toBeLessThanOrEqual(72);
  });

  it("reuses the same code for later sends from the same unpaired device", async () => {
    const dev = deviceId();
    const a = await body(await call("/api/v1/sessions", { body: { deviceId: dev, session: session() } }));
    const b = await body(await call("/api/v1/sessions", { body: { deviceId: dev, session: session() } }));
    expect(b.pairCode).toBe(a.pairCode);
  });

  it("gives a fresh code once the old one expired", async () => {
    const dev = deviceId();
    const a = await body(await call("/api/v1/sessions", { body: { deviceId: dev, session: session() } }));
    await env.DB.prepare("UPDATE devices SET pair_expires_at = 1 WHERE device_id = ?").bind(dev).run();
    const b = await body(await call("/api/v1/sessions", { body: { deviceId: dev, session: session() } }));
    expect(b.pairCode).toMatch(/^DIYA-/);
    expect(Date.parse(b.pairExpiresAt)).toBeGreaterThan(Date.now());
    expect(b.pairCode === a.pairCode && Date.parse(b.pairExpiresAt) <= Date.now()).toBe(false);
  });

  it("is idempotent for a resend of the same session", async () => {
    const dev = deviceId();
    const s = session();
    expect((await call("/api/v1/sessions", { body: { deviceId: dev, session: s } })).status).toBe(201);
    expect((await call("/api/v1/sessions", { body: { deviceId: dev, session: s } })).status).toBe(200);
    const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM sessions WHERE id = ?").bind(s.sessionId).first<{ n: number }>();
    expect(n!.n).toBe(1);
  });

  it("refuses a session id that belongs to another device", async () => {
    const s = session();
    await call("/api/v1/sessions", { body: { deviceId: deviceId(), session: s } });
    const r = await call("/api/v1/sessions", { body: { deviceId: deviceId(), session: s } });
    expect(r.status).toBe(409);
  });

  it("answers the CORS preflight", async () => {
    const r = await call("/api/v1/sessions", { method: "OPTIONS" });
    expect(r.status).toBe(204);
    expect(r.headers.get("access-control-allow-methods")).toContain("POST");
  });

  const bad: [string, (s: J) => void][] = [
    ["wrong schema", (s) => (s.schema = "purna.session.v0")],
    ["bad preset", (s) => (s.settings.preset = "extreme")],
    ["bad date", (s) => (s.startedAt = "yesterday")],
    ["string where a number goes", (s) => (s.near.leftHits = "9")],
    ["hits above total", (s) => (s.near.leftHits = 99)],
    ["coc out of range", (s) => (s.near.coc = 3)],
    ["too many diyas", (s) => (s.near.items = Array.from({ length: 65 }, (_, i) => ({ id: i, x: 0, u: 0, kind: "whole", chip: null, side: "L" })))],
    ["too many pinches", (s) => (s.near.events = Array.from({ length: 601 }, () => ({ t: 1, id: 0, r: "lit", yaw: 0 })))],
    ["long string", (s) => (s.summary = "x".repeat(301))],
    ["bad event result", (s) => (s.near.events = [{ t: 1, id: 0, r: "boom", yaw: 0 }])],
    ["bad session id", (s) => (s.sessionId = "../../etc")],
    ["empty summary", (s) => (s.summary = "  ")],
  ];
  for (const [label, mutate] of bad) {
    it(`rejects ${label} with 400 and stores nothing`, async () => {
      const s = session() as J;
      mutate(s);
      const r = await call("/api/v1/sessions", { body: { deviceId: deviceId(), session: s } });
      expect(r.status).toBe(400);
      expect((await body(r)).error.code).toBe("bad_session");
      const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM sessions WHERE id = ?").bind(String(s.sessionId)).first<{ n: number }>();
      expect(n!.n).toBe(0);
    });
  }

  it("rejects a bad deviceId, non-JSON, wrong content type and bodies over 64 KB", async () => {
    expect((await call("/api/v1/sessions", { body: { deviceId: "abc", session: session() } })).status).toBe(400);
    expect((await call("/api/v1/sessions", { raw: "{not json" })).status).toBe(400);
    expect((await call("/api/v1/sessions", { raw: "[]" })).status).toBe(400);
    expect((await call("/api/v1/sessions", { raw: "{}", headers: { "content-type": "text/plain" } })).status).toBe(415);
    const big = JSON.stringify({ deviceId: deviceId(), session: session(), pad: "x".repeat(70_000) });
    expect((await call("/api/v1/sessions", { raw: big })).status).toBe(413);
  });
});

describe("pairing", () => {
  it("pairs with a code, links earlier sessions, and later sessions link on arrival", async () => {
    const { dev, key, firstSessionId } = await paired("Papa");
    const later = await body(await call("/api/v1/sessions", { body: { deviceId: dev, session: session() } }));
    expect(later.linked).toBe(true);
    expect(later.pairCode).toBeUndefined();
    const me = await body(await call("/api/v1/me", { auth: key }));
    expect(me.patient.name).toBe("Papa");
    expect(me.sessions).toHaveLength(2);
    expect(me.sessions.map((s: J) => s.id)).toContain(firstSessionId);
  });

  it("accepts the code typed loosely (lowercase, no dash)", async () => {
    const dev = deviceId();
    const { pairCode } = await body(await call("/api/v1/sessions", { body: { deviceId: dev, session: session() } }));
    const loose = pairCode.replace("DIYA-", "diya ").toLowerCase();
    const r = await call("/api/v1/pair", { body: { code: loose, name: "  Ramesh   Bhai " } });
    expect(r.status).toBe(200);
    expect((await body(r)).patient.name).toBe("Ramesh Bhai");
  });

  it("a second attempt with the same code gets 409 'Already paired'", async () => {
    const { pairCode } = await paired();
    const r = await call("/api/v1/pair", { body: { code: pairCode, name: "Someone" } });
    expect(r.status).toBe(409);
    expect((await body(r)).error.message).toContain("Already paired");
  });

  it("unknown and expired codes are 404; bad names are 400", async () => {
    expect((await call("/api/v1/pair", { body: { code: "DIYA-2222", name: "x" } })).status).toBe(404);
    const dev = deviceId();
    const { pairCode } = await body(await call("/api/v1/sessions", { body: { deviceId: dev, session: session() } }));
    expect((await call("/api/v1/pair", { body: { code: pairCode, name: "" } })).status).toBe(400);
    expect((await call("/api/v1/pair", { body: { code: pairCode, name: "x".repeat(41) } })).status).toBe(400);
    expect((await call("/api/v1/pair", { body: { code: "DIYA-0000", name: "x" } })).status).toBe(400);
    await env.DB.prepare("UPDATE devices SET pair_expires_at = 1 WHERE device_id = ?").bind(dev).run();
    const r = await call("/api/v1/pair", { body: { code: pairCode, name: "Papa" } });
    expect(r.status).toBe(404);
    expect((await body(r)).error.code).toBe("expired_code");
  });

  it("stores only a hash of the family key", async () => {
    const { key } = await paired();
    const row = await env.DB.prepare("SELECT key_hash FROM patients WHERE key_hash = ?").bind(key).first();
    expect(row).toBeNull();
    expect(key).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });
});

describe("family routes", () => {
  it("need a valid key", async () => {
    expect((await call("/api/v1/me")).status).toBe(401);
    expect((await call("/api/v1/me", { auth: "A".repeat(43) })).status).toBe(401);
  });

  it("dashboard cards carry the plain summary and left/right %", async () => {
    const { key } = await paired();
    const me = await body(await call("/api/v1/me", { auth: key }));
    const c = me.sessions[0];
    expect(c.summary).toMatch(/^Found \d+ of \d+ on the left/);
    expect(c.leftPct).toBeCloseTo(c.leftHits / c.leftTotal, 3);
    expect(c).toHaveProperty("maxLeftDeg");
    expect(c).not.toHaveProperty("json");
  });

  it("returns the full session JSON, only for the family's own sessions", async () => {
    const a = await paired("A");
    const b = await paired("B");
    const own = await call(`/api/v1/me/sessions/${a.firstSessionId}`, { auth: a.key });
    expect(own.status).toBe(200);
    expect((await body(own)).session.schema).toBe("purna.session.v1");
    expect((await call(`/api/v1/me/sessions/${a.firstSessionId}`, { auth: b.key })).status).toBe(404);
  });

  it("imports a Logger session; a repeat import is a no-op", async () => {
    const { key } = await paired();
    const s = session();
    expect((await call("/api/v1/me/import", { auth: key, body: { session: s } })).status).toBe(201);
    const again = await call("/api/v1/me/import", { auth: key, body: { session: s } });
    expect(again.status).toBe(200);
    expect((await body(again)).duplicate).toBe(true);
    expect((await call("/api/v1/me/import", { auth: key, body: { session: { schema: "nope" } } })).status).toBe(400);
  });
});

describe("doctor link", () => {
  it("lasts 7 days by default, shows every session, and takes notes the family can see", async () => {
    const { key } = await paired("Papa");
    const sh = await body(await call("/api/v1/me/shares", { auth: key, body: {} }));
    const days = (Date.parse(sh.expiresAt) - Date.now()) / 86400000;
    expect(days).toBeGreaterThan(6.99);
    expect(days).toBeLessThanOrEqual(7);

    const d = await call("/api/v1/doctor", { auth: sh.token });
    expect(d.status).toBe(200);
    const doc = await body(d);
    expect(doc.patient).toEqual({ name: "Papa" });
    expect(doc.sessions[0].near.items.length).toBeGreaterThan(0);

    const n = await call("/api/v1/doctor/notes", { auth: sh.token, body: { text: "Good effort. Try hint delay 4 s next week." } });
    expect(n.status).toBe(201);
    const me = await body(await call("/api/v1/me", { auth: key }));
    expect(me.notes[0].text).toBe("Good effort. Try hint delay 4 s next week.");
    expect(me.shares).toHaveLength(1);
  });

  it("can be revoked, and then says it has expired", async () => {
    const { key } = await paired();
    const sh = await body(await call("/api/v1/me/shares", { auth: key, body: { days: 3 } }));
    expect((await call(`/api/v1/me/shares/${sh.id}`, { method: "DELETE", auth: key })).status).toBe(204);
    const r = await call("/api/v1/doctor", { auth: sh.token });
    expect(r.status).toBe(410);
    expect((await body(r)).error.message).toBe("This link has expired. Ask the family for a new one.");
    expect((await call("/api/v1/doctor/notes", { auth: sh.token, body: { text: "hi" } })).status).toBe(410);
  });

  it("expires on time", async () => {
    const { key } = await paired();
    const sh = await body(await call("/api/v1/me/shares", { auth: key, body: { days: 1 } }));
    await env.DB.prepare("UPDATE shares SET expires_at = 1 WHERE id = ?").bind(sh.id).run();
    expect((await call("/api/v1/doctor", { auth: sh.token })).status).toBe(410);
  });

  it("rejects bad durations, bad notes, and another family's share id", async () => {
    const a = await paired();
    const b = await paired();
    expect((await call("/api/v1/me/shares", { auth: a.key, body: { days: 15 } })).status).toBe(400);
    expect((await call("/api/v1/me/shares", { auth: a.key, body: { days: 2.5 } })).status).toBe(400);
    const sh = await body(await call("/api/v1/me/shares", { auth: a.key, body: {} }));
    expect((await call("/api/v1/doctor/notes", { auth: sh.token, body: { text: "" } })).status).toBe(400);
    expect((await call("/api/v1/doctor/notes", { auth: sh.token, body: { text: "x".repeat(1001) } })).status).toBe(400);
    expect((await call(`/api/v1/me/shares/${sh.id}`, { method: "DELETE", auth: b.key })).status).toBe(404);
  });
});

describe("delete everything", () => {
  it("needs the display name, then removes patient, device, sessions, shares and notes", async () => {
    const { dev, key } = await paired("Papa");
    const sh = await body(await call("/api/v1/me/shares", { auth: key, body: {} }));
    await call("/api/v1/doctor/notes", { auth: sh.token, body: { text: "note" } });

    expect((await call("/api/v1/me", { method: "DELETE", auth: key, body: { confirm: "Mummy" } })).status).toBe(400);
    expect((await call("/api/v1/me", { method: "DELETE", auth: key, body: { confirm: "papa" } })).status).toBe(204);

    expect((await call("/api/v1/me", { auth: key })).status).toBe(401);
    expect((await call("/api/v1/doctor", { auth: sh.token })).status).toBe(410);
    const left = await env.DB.batch([
      env.DB.prepare("SELECT COUNT(*) AS n FROM devices WHERE device_id = ?").bind(dev),
      env.DB.prepare("SELECT COUNT(*) AS n FROM sessions WHERE device_id = ?").bind(dev),
      env.DB.prepare("SELECT COUNT(*) AS n FROM shares WHERE id = ?").bind(sh.id),
      env.DB.prepare("SELECT COUNT(*) AS n FROM notes WHERE share_id = ?").bind(sh.id),
    ]);
    for (const r of left) expect((r.results[0] as { n: number }).n).toBe(0);

    // The glasses can start again: a new session gets a new code.
    const again = await body(await call("/api/v1/sessions", { body: { deviceId: dev, session: session() } }));
    expect(again.linked).toBe(false);
    expect(again.pairCode).toMatch(/^DIYA-/);
  });
});

describe("pair codes", () => {
  it("use only the unambiguous alphabet and normalise typed input", () => {
    for (let i = 0; i < 500; i++) {
      const c = newPairCode();
      expect(c).toMatch(/^DIYA-.{4}$/);
      for (const ch of c.slice(5)) expect(PAIR_ALPHABET).toContain(ch);
    }
    expect(normalizePairCode(" diya-7k3p ")).toBe("DIYA-7K3P");
    expect(normalizePairCode("7K3P")).toBe("DIYA-7K3P");
    expect(normalizePairCode("DIYA-7K3O")).toBeNull();
    expect(normalizePairCode("DIYA-7K3")).toBeNull();
  });
});

describe("therapist sets the next session", () => {
  it("the doctor sets a plan; the family and the glasses see it; the next session uses it up", async () => {
    const { dev, key } = await paired("Papa");
    const sh = await body(await call("/api/v1/me/shares", { auth: key, body: {} }));

    expect((await body(await call(`/api/v1/devices/${dev}/next`))).plan).toBeNull();
    const set = await call("/api/v1/doctor/plan", { auth: sh.token, body: { preset: "easy", hintDelayS: 4 } });
    expect(set.status).toBe(201);
    const plan = (await body(set)).plan;
    expect(plan).toMatchObject({ preset: "easy", hintDelayS: 4 });

    const glasses = await call(`/api/v1/devices/${dev}/next`);
    expect(glasses.headers.get("access-control-allow-origin")).toBe("*");
    expect((await body(glasses)).plan).toEqual(plan);
    expect((await body(await call("/api/v1/me", { auth: key }))).plan).toEqual(plan);
    expect((await body(await call("/api/v1/doctor", { auth: sh.token }))).plan).toEqual(plan);

    // Changing it replaces it.
    await call("/api/v1/doctor/plan", { auth: sh.token, body: { preset: "hard", hintDelayS: 10 } });
    expect((await body(await call(`/api/v1/devices/${dev}/next`))).plan).toMatchObject({ preset: "hard", hintDelayS: 10 });

    await call("/api/v1/sessions", { body: { deviceId: dev, session: session() } });
    expect((await body(await call(`/api/v1/devices/${dev}/next`))).plan).toBeNull();
    expect((await body(await call("/api/v1/doctor", { auth: sh.token }))).plan).toBeNull();
  });

  it("can be cleared, validates its fields, and needs a live doctor link", async () => {
    const { dev, key } = await paired("Papa");
    const sh = await body(await call("/api/v1/me/shares", { auth: key, body: {} }));
    for (const bad of [{ preset: "extreme", hintDelayS: 6 }, { preset: "easy", hintDelayS: 5 }, { preset: "easy" }, {}]) {
      expect((await call("/api/v1/doctor/plan", { auth: sh.token, body: bad })).status).toBe(400);
    }
    await call("/api/v1/doctor/plan", { auth: sh.token, body: { preset: "standard", hintDelayS: 6 } });
    expect((await call("/api/v1/doctor/plan", { method: "DELETE", auth: sh.token })).status).toBe(204);
    expect((await body(await call(`/api/v1/devices/${dev}/next`))).plan).toBeNull();

    await call(`/api/v1/me/shares/${sh.id}`, { method: "DELETE", auth: key });
    expect((await call("/api/v1/doctor/plan", { auth: sh.token, body: { preset: "easy", hintDelayS: 4 } })).status).toBe(410);
    expect((await call("/api/v1/doctor/plan", { body: { preset: "easy", hintDelayS: 4 } })).status).toBe(401);
  });

  it("the glasses get null for an unknown or unpaired device, and 400 for a bad id", async () => {
    expect((await body(await call(`/api/v1/devices/${deviceId()}/next`))).plan).toBeNull();
    const dev = deviceId();
    await call("/api/v1/sessions", { body: { deviceId: dev, session: session() } });
    expect((await body(await call(`/api/v1/devices/${dev}/next`))).plan).toBeNull();
    expect((await call("/api/v1/devices/not-hex/next")).status).toBe(400);
  });

  it("goes with Delete everything", async () => {
    const { key } = await paired("Papa");
    const sh = await body(await call("/api/v1/me/shares", { auth: key, body: {} }));
    await call("/api/v1/doctor/plan", { auth: sh.token, body: { preset: "easy", hintDelayS: 4 } });
    const pid = ((await env.DB.prepare("SELECT patient_id FROM shares WHERE id = ?").bind(sh.id).first()) as { patient_id: string }).patient_id;
    await call("/api/v1/me", { method: "DELETE", auth: key, body: { confirm: "Papa" } });
    expect(await env.DB.prepare("SELECT 1 FROM plans WHERE patient_id = ?").bind(pid).first()).toBeNull();
  });
});
