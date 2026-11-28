// Purna Family API, /api/v1 (docs/03-ARCHITECTURE.md §6.2).

import type { SessionJson } from "../../Assets/Scripts/Core/Report";
import { newId, newPairCode, newSecret, normalizePairCode, sha256 } from "./lib/crypto";
import { bearer, errorResponse, HttpError, json, readJson } from "./lib/http";
import { callerIp, enforce, RETRY_AFTER_S, type RateLimiter } from "./lib/limits";
import { cleanName, cleanNote, validateSession, validDeviceId } from "./lib/validate";

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  /** 10 pairing attempts a minute per caller IP: slows down guessing DIYA codes. */
  PAIR_LIMIT: RateLimiter;
  /** 20 sessions a minute per glasses (deviceId). */
  SESSION_LIMIT: RateLimiter;
  /** 10 notes a minute per doctor link, on top of the 50-note cap per link. */
  NOTE_LIMIT: RateLimiter;
}

export const API_VERSION = "1.0.0";
const PAIR_TTL_MS = 72 * 3600 * 1000;
const DAY_MS = 24 * 3600 * 1000;
const MAX_SESSIONS_LISTED = 200;

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type",
  "access-control-max-age": "86400",
};

interface PatientRow {
  id: string;
  name: string;
  created_at: number;
}

interface SessionRow {
  id: string;
  started_at: string;
  preset: string;
  summary: string;
  left_hits: number;
  left_total: number;
  right_hits: number;
  right_total: number;
  coc: number | null;
  hints: number;
  max_left_deg: number;
  ended_by: string;
  json: string;
}

function pct(hits: number, total: number): number | null {
  return total > 0 ? Math.round((hits / total) * 1000) / 1000 : null;
}

function card(r: SessionRow) {
  return {
    id: r.id,
    startedAt: r.started_at,
    preset: r.preset,
    summary: r.summary,
    leftHits: r.left_hits,
    leftTotal: r.left_total,
    rightHits: r.right_hits,
    rightTotal: r.right_total,
    leftPct: pct(r.left_hits, r.left_total),
    rightPct: pct(r.right_hits, r.right_total),
    coc: r.coc,
    hints: r.hints,
    maxLeftDeg: r.max_left_deg,
    endedBy: r.ended_by,
  };
}

function insertSession(env: Env, s: SessionJson, deviceId: string | null, patientId: string | null, now: number) {
  return env.DB.prepare(
    `INSERT INTO sessions (id, device_id, patient_id, received_at, started_at, preset, left_hits, left_total,
       right_hits, right_total, coc, hints, max_left_deg, ended_by, summary, json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    s.sessionId,
    deviceId,
    patientId,
    now,
    new Date(s.startedAt).toISOString(),
    s.settings.preset,
    s.near.leftHits,
    s.near.leftTotal,
    s.near.rightHits,
    s.near.rightTotal,
    s.near.coc,
    s.cues.hint1 + s.cues.hint2,
    s.head.maxLeftDeg,
    s.near.endedBy,
    s.summary,
    JSON.stringify(s),
  );
}

// ---------- Lens → server ----------

async function postSession(req: Request, env: Env): Promise<Response> {
  const body = await readJson(req);
  if (!validDeviceId(body.deviceId)) throw new HttpError(400, "bad_device", "deviceId must be 32 hex characters.");
  const deviceId = body.deviceId;
  await enforce(env.SESSION_LIMIT, `session:${deviceId}`);
  const session = validateSession(body.session);
  const now = Date.now();

  const existing = await env.DB.prepare("SELECT device_id FROM sessions WHERE id = ?").bind(session.sessionId).first<{ device_id: string | null }>();
  if (existing && existing.device_id !== deviceId) throw new HttpError(409, "duplicate_id", "A session with this id already exists.");

  let device = await env.DB.prepare("SELECT patient_id, pair_code, pair_expires_at FROM devices WHERE device_id = ?")
    .bind(deviceId)
    .first<{ patient_id: string | null; pair_code: string | null; pair_expires_at: number | null }>();
  if (!device) {
    await env.DB.prepare("INSERT INTO devices (device_id, created_at) VALUES (?, ?)").bind(deviceId, now).run();
    device = { patient_id: null, pair_code: null, pair_expires_at: null };
  }

  let pairCode: string | undefined;
  let pairExpiresAt: number | undefined;
  if (!device.patient_id) {
    if (device.pair_code && device.pair_expires_at && device.pair_expires_at > now) {
      pairCode = device.pair_code;
      pairExpiresAt = device.pair_expires_at;
    } else {
      // Fresh code; retry on the (rare) unique collision.
      for (let attempt = 0; attempt < 6 && !pairCode; attempt++) {
        const code = newPairCode();
        const exp = now + PAIR_TTL_MS;
        const r = await env.DB.prepare(
          "UPDATE devices SET pair_code = ?, pair_expires_at = ? WHERE device_id = ? AND NOT EXISTS (SELECT 1 FROM devices WHERE pair_code = ?)",
        )
          .bind(code, exp, deviceId, code)
          .run();
        if (r.meta.changes === 1) {
          pairCode = code;
          pairExpiresAt = exp;
        }
      }
      if (!pairCode) throw new HttpError(503, "busy", "Couldn't make a pairing code. Try again.");
    }
  }

  if (!existing) {
    if (device.patient_id) {
      // A new session uses up any plan the therapist set for it.
      await env.DB.batch([insertSession(env, session, deviceId, device.patient_id, now), env.DB.prepare("DELETE FROM plans WHERE patient_id = ?").bind(device.patient_id)]);
    } else {
      await insertSession(env, session, deviceId, null, now).run();
    }
  }

  const out: Record<string, unknown> = { sessionId: session.sessionId, linked: !!device.patient_id };
  if (pairCode) {
    out.pairCode = pairCode;
    out.pairExpiresAt = new Date(pairExpiresAt!).toISOString();
  }
  return json(existing ? 200 : 201, out, CORS);
}

// ---------- pairing ----------

async function postPair(req: Request, env: Env): Promise<Response> {
  const ip = callerIp(req);
  if (ip) await enforce(env.PAIR_LIMIT, `pair:${ip}`);
  const body = await readJson(req);
  const code = typeof body.code === "string" ? normalizePairCode(body.code) : null;
  if (!code) throw new HttpError(400, "bad_code", "That code doesn't look right. It's like DIYA-7K3P.");
  const name = cleanName(body.name);
  if (!name) throw new HttpError(400, "bad_name", "Type a name between 1 and 40 characters.");
  const now = Date.now();

  const device = await env.DB.prepare("SELECT device_id, patient_id, pair_expires_at FROM devices WHERE pair_code = ?")
    .bind(code)
    .first<{ device_id: string; patient_id: string | null; pair_expires_at: number | null }>();
  if (!device) throw new HttpError(404, "unknown_code", "We couldn't find that code. Check it on the glasses.");
  // The code stays on a paired device so a second attempt gets a clear answer instead of "not found".
  if (device.patient_id) throw new HttpError(409, "already_paired", "Already paired. Ask your family for the invite link.");
  if (!device.pair_expires_at || device.pair_expires_at <= now) {
    throw new HttpError(404, "expired_code", "That code has expired. Send a new session from the glasses for a fresh one.");
  }

  const familyKey = newSecret();
  const patientId = newId("p");
  const results = await env.DB.batch([
    env.DB.prepare("INSERT INTO patients (id, name, key_hash, created_at) VALUES (?, ?, ?, ?)").bind(patientId, name, await sha256(familyKey), now),
    env.DB.prepare("UPDATE devices SET patient_id = ? WHERE device_id = ? AND patient_id IS NULL").bind(patientId, device.device_id),
    env.DB.prepare("UPDATE sessions SET patient_id = ? WHERE device_id = ? AND patient_id IS NULL").bind(patientId, device.device_id),
  ]);
  if (results[1].meta.changes !== 1) {
    // Lost a race with another pairing of the same code: undo our patient row.
    await env.DB.prepare("DELETE FROM patients WHERE id = ?").bind(patientId).run();
    throw new HttpError(409, "already_paired", "Already paired. Ask your family for the invite link.");
  }
  return json(200, { familyKey, patient: { name } });
}

// ---------- family (Bearer familyKey) ----------

async function family(req: Request, env: Env): Promise<PatientRow> {
  const key = bearer(req);
  if (!key) throw new HttpError(401, "no_key", "Sign in with your family link.");
  const p = await env.DB.prepare("SELECT id, name, created_at FROM patients WHERE key_hash = ?").bind(await sha256(key)).first<PatientRow>();
  if (!p) throw new HttpError(401, "bad_key", "This family link isn't valid any more.");
  return p;
}

async function getMe(p: PatientRow, env: Env): Promise<Response> {
  const now = Date.now();
  const [sessions, notes, shares] = await env.DB.batch([
    env.DB.prepare(
      `SELECT id, started_at, preset, summary, left_hits, left_total, right_hits, right_total, coc, hints, max_left_deg, ended_by
       FROM sessions WHERE patient_id = ? ORDER BY started_at DESC LIMIT ${MAX_SESSIONS_LISTED}`,
    ).bind(p.id),
    env.DB.prepare("SELECT id, text, created_at FROM notes WHERE patient_id = ? ORDER BY created_at DESC LIMIT 100").bind(p.id),
    env.DB.prepare("SELECT id, expires_at, created_at FROM shares WHERE patient_id = ? AND revoked = 0 AND expires_at > ? ORDER BY created_at DESC").bind(p.id, now),
  ]);
  const plan = await activePlan(env, p.id);
  return json(200, {
    patient: { name: p.name, createdAt: new Date(p.created_at).toISOString() },
    plan,
    sessions: (sessions.results as unknown as SessionRow[]).map(card),
    notes: (notes.results as { id: string; text: string; created_at: number }[]).map((n) => ({
      id: n.id,
      text: n.text,
      createdAt: new Date(n.created_at).toISOString(),
    })),
    shares: (shares.results as { id: string; expires_at: number; created_at: number }[]).map((s) => ({
      id: s.id,
      expiresAt: new Date(s.expires_at).toISOString(),
      createdAt: new Date(s.created_at).toISOString(),
    })),
  });
}

async function getMySession(p: PatientRow, id: string, env: Env): Promise<Response> {
  const r = await env.DB.prepare("SELECT json FROM sessions WHERE id = ? AND patient_id = ?").bind(id, p.id).first<{ json: string }>();
  if (!r) throw new HttpError(404, "not_found", "No such session.");
  return json(200, { session: JSON.parse(r.json) });
}

async function postImport(p: PatientRow, req: Request, env: Env): Promise<Response> {
  const body = await readJson(req);
  const session = validateSession(body.session);
  const existing = await env.DB.prepare("SELECT patient_id FROM sessions WHERE id = ?").bind(session.sessionId).first<{ patient_id: string | null }>();
  if (existing) {
    if (existing.patient_id === p.id) return json(200, { sessionId: session.sessionId, duplicate: true });
    throw new HttpError(409, "duplicate_id", "A session with this id already exists.");
  }
  await insertSession(env, session, null, p.id, Date.now()).run();
  return json(201, { sessionId: session.sessionId });
}

async function postShare(p: PatientRow, req: Request, env: Env): Promise<Response> {
  const body = await readJson(req);
  const days = body.days === undefined ? 7 : body.days;
  if (typeof days !== "number" || !Number.isInteger(days) || days < 1 || days > 14) {
    throw new HttpError(400, "bad_days", "days must be a whole number from 1 to 14.");
  }
  const token = newSecret();
  const id = newId("sh");
  const now = Date.now();
  const expiresAt = now + days * DAY_MS;
  await env.DB.prepare("INSERT INTO shares (id, patient_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(id, p.id, await sha256(token), expiresAt, now)
    .run();
  return json(201, { id, token, expiresAt: new Date(expiresAt).toISOString() });
}

async function deleteShare(p: PatientRow, id: string, env: Env): Promise<Response> {
  const r = await env.DB.prepare("UPDATE shares SET revoked = 1 WHERE id = ? AND patient_id = ?").bind(id, p.id).run();
  if (r.meta.changes !== 1) throw new HttpError(404, "not_found", "No such link.");
  return json(204, null);
}

async function deleteMe(p: PatientRow, req: Request, env: Env): Promise<Response> {
  const body = await readJson(req);
  const confirm = cleanName(body.confirm);
  if (!confirm || confirm.toLowerCase() !== p.name.toLowerCase()) {
    throw new HttpError(400, "confirm_mismatch", `Type "${p.name}" to confirm.`);
  }
  await env.DB.batch([
    env.DB.prepare("DELETE FROM notes WHERE patient_id = ?").bind(p.id),
    env.DB.prepare("DELETE FROM plans WHERE patient_id = ?").bind(p.id),
    env.DB.prepare("DELETE FROM shares WHERE patient_id = ?").bind(p.id),
    env.DB.prepare("DELETE FROM sessions WHERE patient_id = ?").bind(p.id),
    env.DB.prepare("DELETE FROM sessions WHERE device_id IN (SELECT device_id FROM devices WHERE patient_id = ?)").bind(p.id),
    env.DB.prepare("DELETE FROM devices WHERE patient_id = ?").bind(p.id),
    env.DB.prepare("DELETE FROM patients WHERE id = ?").bind(p.id),
  ]);
  return json(204, null);
}

// ---------- doctor (Bearer share token) ----------

async function doctor(req: Request, env: Env): Promise<{ share: { id: string; expires_at: number }; patient: PatientRow }> {
  const token = bearer(req);
  if (!token) throw new HttpError(401, "no_token", "This link is missing its key.");
  const row = await env.DB.prepare(
    `SELECT s.id AS share_id, s.expires_at, s.revoked, p.id, p.name, p.created_at
     FROM shares s JOIN patients p ON p.id = s.patient_id WHERE s.token_hash = ?`,
  )
    .bind(await sha256(token))
    .first<{ share_id: string; expires_at: number; revoked: number; id: string; name: string; created_at: number }>();
  if (!row || row.revoked || row.expires_at <= Date.now()) {
    throw new HttpError(410, "expired", "This link has expired. Ask the family for a new one.");
  }
  return { share: { id: row.share_id, expires_at: row.expires_at }, patient: { id: row.id, name: row.name, created_at: row.created_at } };
}

async function getDoctor(req: Request, env: Env): Promise<Response> {
  const { share, patient } = await doctor(req, env);
  const [sessions, notes] = await env.DB.batch([
    env.DB.prepare(`SELECT json FROM sessions WHERE patient_id = ? ORDER BY started_at DESC LIMIT ${MAX_SESSIONS_LISTED}`).bind(patient.id),
    env.DB.prepare("SELECT id, text, created_at FROM notes WHERE patient_id = ? ORDER BY created_at DESC LIMIT 100").bind(patient.id),
  ]);
  const plan = await activePlan(env, patient.id);
  return json(200, {
    patient: { name: patient.name },
    plan,
    expiresAt: new Date(share.expires_at).toISOString(),
    sessions: (sessions.results as { json: string }[]).map((r) => JSON.parse(r.json)),
    notes: (notes.results as { id: string; text: string; created_at: number }[]).map((n) => ({
      id: n.id,
      text: n.text,
      createdAt: new Date(n.created_at).toISOString(),
    })),
  });
}

async function postDoctorNote(req: Request, env: Env): Promise<Response> {
  const { share, patient } = await doctor(req, env);
  await enforce(env.NOTE_LIMIT, `note:${share.id}`);
  const body = await readJson(req);
  const text = cleanNote(body.text);
  if (!text) throw new HttpError(400, "bad_note", "A note is 1 to 1000 characters.");
  const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM notes WHERE share_id = ?").bind(share.id).first<{ n: number }>();
  if ((count?.n ?? 0) >= 50) throw new HttpError(429, "too_many_notes", "This link has reached its note limit.");
  const id = newId("n");
  const now = Date.now();
  await env.DB.prepare("INSERT INTO notes (id, patient_id, share_id, text, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(id, patient.id, share.id, text, now)
    .run();
  return json(201, { id, createdAt: new Date(now).toISOString() });
}

// ---------- next session set by the therapist ----------

const PLAN_PRESETS = ["easy", "standard", "hard"];
const PLAN_DELAYS = [4, 6, 10];

interface PlanRow {
  preset: string;
  hint_delay_s: number;
  set_at: number;
}

/** The plan still waiting for its session (a new session from the glasses deletes it), or null. */
async function activePlan(env: Env, patientId: string) {
  const r = await env.DB.prepare("SELECT preset, hint_delay_s, set_at FROM plans WHERE patient_id = ?").bind(patientId).first<PlanRow>();
  return r ? { preset: r.preset, hintDelayS: r.hint_delay_s, setAt: new Date(r.set_at).toISOString() } : null;
}

async function postDoctorPlan(req: Request, env: Env): Promise<Response> {
  const { share, patient } = await doctor(req, env);
  await enforce(env.NOTE_LIMIT, `plan:${share.id}`);
  const body = await readJson(req);
  if (typeof body.preset !== "string" || PLAN_PRESETS.indexOf(body.preset) < 0) {
    throw new HttpError(400, "bad_preset", "preset must be easy, standard or hard.");
  }
  if (typeof body.hintDelayS !== "number" || PLAN_DELAYS.indexOf(body.hintDelayS) < 0) {
    throw new HttpError(400, "bad_delay", "hintDelayS must be 4, 6 or 10.");
  }
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO plans (patient_id, preset, hint_delay_s, share_id, set_at) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(patient_id) DO UPDATE SET preset = excluded.preset, hint_delay_s = excluded.hint_delay_s,
       share_id = excluded.share_id, set_at = excluded.set_at`,
  )
    .bind(patient.id, body.preset, body.hintDelayS, share.id, now)
    .run();
  return json(201, { plan: { preset: body.preset, hintDelayS: body.hintDelayS, setAt: new Date(now).toISOString() } });
}

async function deleteDoctorPlan(req: Request, env: Env): Promise<Response> {
  const { patient } = await doctor(req, env);
  await env.DB.prepare("DELETE FROM plans WHERE patient_id = ?").bind(patient.id).run();
  return json(204, null);
}

/** For the glasses' setup panel: the therapist's plan for this device's patient, if one is waiting. */
async function getDeviceNext(deviceId: string, env: Env): Promise<Response> {
  if (!validDeviceId(deviceId)) throw new HttpError(400, "bad_device", "deviceId must be 32 hex characters.");
  await enforce(env.SESSION_LIMIT, `session:${deviceId}`);
  const d = await env.DB.prepare("SELECT patient_id FROM devices WHERE device_id = ?").bind(deviceId).first<{ patient_id: string | null }>();
  const plan = d && d.patient_id ? await activePlan(env, d.patient_id) : null;
  return json(200, { plan }, CORS);
}

// ---------- router ----------

export async function handleApi(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, "");
  const m = req.method;
  const deviceNext = /^\/api\/v1\/devices\/([^/]{1,64})\/next$/.exec(path);
  const isSessions = path === "/api/v1/sessions" || !!deviceNext;
  try {
    if (path === "/api/v1/health" && m === "GET") return json(200, { ok: true, version: API_VERSION });
    if (isSessions && m === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (isSessions && m === "POST") return await postSession(req, env);
    if (deviceNext && m === "GET") return await getDeviceNext(deviceNext[1], env);
    if (path === "/api/v1/pair" && m === "POST") return await postPair(req, env);

    if (path === "/api/v1/me") {
      if (m === "GET") return await getMe(await family(req, env), env);
      if (m === "DELETE") return await deleteMe(await family(req, env), req, env);
    }
    if (path === "/api/v1/me/import" && m === "POST") return await postImport(await family(req, env), req, env);
    if (path === "/api/v1/me/shares" && m === "POST") return await postShare(await family(req, env), req, env);
    let mm = /^\/api\/v1\/me\/shares\/([A-Za-z0-9_-]{1,40})$/.exec(path);
    if (mm && m === "DELETE") return await deleteShare(await family(req, env), mm[1], env);
    mm = /^\/api\/v1\/me\/sessions\/([A-Za-z0-9_-]{1,64})$/.exec(path);
    if (mm && m === "GET") return await getMySession(await family(req, env), mm[1], env);

    if (path === "/api/v1/doctor" && m === "GET") return await getDoctor(req, env);
    if (path === "/api/v1/doctor/notes" && m === "POST") return await postDoctorNote(req, env);
    if (path === "/api/v1/doctor/plan" && m === "POST") return await postDoctorPlan(req, env);
    if (path === "/api/v1/doctor/plan" && m === "DELETE") return await deleteDoctorPlan(req, env);

    throw new HttpError(404, "no_route", "Not found.");
  } catch (e) {
    const extra = isSessions ? CORS : {};
    if (e instanceof HttpError) return errorResponse(e, e.status === 429 && e.code === "slow_down" ? { ...extra, "retry-after": String(RETRY_AFTER_S) } : extra);
    console.error("purna-family error", e instanceof Error ? e.message : String(e));
    return errorResponse(new HttpError(500, "server_error", "Something went wrong on our side."), extra);
  }
}
