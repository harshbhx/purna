// Retention: unpaired sessions go after 30 days, ended doctor links after 30 more, paired families' data stays.
import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import { cleanup, ENDED_LINK_KEEP_DAYS, UNPAIRED_KEEP_DAYS } from "../src/cleanup";
import { call, deviceId, paired, session } from "./helpers";

const DAY = 24 * 3600 * 1000;
const count = async (sql: string, ...b: unknown[]) => ((await env.DB.prepare(sql).bind(...b).first<{ n: number }>())?.n ?? 0);

describe("Daily clean-up", () => {
  it("keeps unpaired sessions for 30 days, then deletes them and their glasses", async () => {
    const dev = deviceId();
    await call("/api/v1/sessions", { body: { deviceId: dev, session: session() } });
    expect(UNPAIRED_KEEP_DAYS).toBe(30);

    await cleanup(env, Date.now() + 29 * DAY);
    expect(await count("SELECT COUNT(*) AS n FROM sessions WHERE device_id = ?", dev)).toBe(1);

    const r = await cleanup(env, Date.now() + 31 * DAY);
    expect(r.unpairedSessions).toBeGreaterThanOrEqual(1);
    expect(await count("SELECT COUNT(*) AS n FROM sessions WHERE device_id = ?", dev)).toBe(0);
    expect(await count("SELECT COUNT(*) AS n FROM devices WHERE device_id = ?", dev)).toBe(0);
  });

  it("never touches a paired family's sessions, however old", async () => {
    const { dev, key } = await paired("Nana");
    await cleanup(env, Date.now() + 3650 * DAY);
    expect(await count("SELECT COUNT(*) AS n FROM sessions WHERE device_id = ?", dev)).toBe(1);
    expect(await count("SELECT COUNT(*) AS n FROM devices WHERE device_id = ?", dev)).toBe(1);
    expect((await call("/api/v1/me", { auth: key })).status).toBe(200);
  });

  it("keeps unpaired glasses that still have a live code", async () => {
    const dev = deviceId();
    await call("/api/v1/sessions", { body: { deviceId: dev, session: session() } });
    await env.DB.prepare("DELETE FROM sessions WHERE device_id = ?").bind(dev).run();
    await cleanup(env);
    expect(await count("SELECT COUNT(*) AS n FROM devices WHERE device_id = ?", dev)).toBe(1);
  });

  it("deletes ended doctor links 30 days after they end, keeps live ones, and keeps the notes", async () => {
    const { key } = await paired("Dadi");
    const mk = async () => ((await (await call("/api/v1/me/shares", { body: { days: 7 }, auth: key })).json()) as { id: string; token: string });
    const live = await mk();
    const stopped = await mk();
    await call("/api/v1/doctor/notes", { body: { text: "Keep going" }, auth: stopped.token });
    await call(`/api/v1/me/shares/${stopped.id}`, { method: "DELETE", auth: key });

    await cleanup(env, Date.now() + 10 * DAY);
    expect(await count("SELECT COUNT(*) AS n FROM shares WHERE id = ?", stopped.id)).toBe(1);

    await cleanup(env, Date.now() + (7 + ENDED_LINK_KEEP_DAYS + 1) * DAY);
    expect(await count("SELECT COUNT(*) AS n FROM shares WHERE id IN (?, ?)", stopped.id, live.id)).toBe(0);
    const me = (await (await call("/api/v1/me", { auth: key })).json()) as { notes: { text: string }[] };
    expect(me.notes.map((n) => n.text)).toContain("Keep going");
  });

  it("runs from the daily cron trigger", async () => {
    const worker = (await import("../src/worker")).default;
    const done: Promise<unknown>[] = [];
    await worker.scheduled!({ cron: "17 3 * * *", scheduledTime: Date.now(), noRetry() {} } as ScheduledController, env as never, { waitUntil: (p: Promise<unknown>) => done.push(p), passThroughOnException() {} } as unknown as ExecutionContext);
    await Promise.all(done);
    expect(done).toHaveLength(1);
  });
});
