import { exports } from "cloudflare:workers";
import sample from "../samples/01-leftNeglect.json";

export const ORIGIN = "https://purna.dualmindlab.tech";

export function call(path: string, init: { method?: string; body?: unknown; auth?: string; raw?: string; headers?: Record<string, string> } = {}) {
  const headers: Record<string, string> = { ...(init.headers ?? {}) };
  if (init.body !== undefined || init.raw !== undefined) headers["content-type"] ??= "application/json";
  if (init.auth) headers.authorization = "Bearer " + init.auth;
  return exports.default.fetch(
    new Request(ORIGIN + path, {
      method: init.method ?? (init.body !== undefined || init.raw !== undefined ? "POST" : "GET"),
      headers,
      body: init.raw ?? (init.body !== undefined ? JSON.stringify(init.body) : undefined),
    }),
  );
}

let n = 0;
/** A valid session with a fresh id. */
export function session(over: Record<string, unknown> = {}) {
  n++;
  return { ...structuredClone(sample), sessionId: `s_test_${n}_${Math.random().toString(36).slice(2, 8)}`, ...over };
}

export function deviceId(): string {
  return [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Sends one session from a new device and pairs it. */
export async function paired(name = "Papa") {
  const dev = deviceId();
  const s = session();
  const r = await call("/api/v1/sessions", { body: { deviceId: dev, session: s } });
  const { pairCode } = (await r.json()) as { pairCode: string };
  const p = await call("/api/v1/pair", { body: { code: pairCode, name } });
  const { familyKey } = (await p.json()) as { familyKey: string };
  return { dev, key: familyKey, firstSessionId: s.sessionId as string, pairCode };
}
