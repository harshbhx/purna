// Validation for purna.session.v1 (docs/03-ARCHITECTURE.md §5 and §6.4).
// Strict on shape and limits so nothing odd is stored; the web app renders text with textContent anyway.

import type { SessionJson } from "../../../Assets/Scripts/Core/Report";
import { HttpError } from "./http";

export const SCHEMA = "purna.session.v1";
const PRESETS = ["easy", "standard", "hard"];
const ENDED_BY = ["complete", "timeout", "finish"];
const RESULTS = ["lit", "chipped", "revisit"];
const MAX_ITEMS = 64;
const MAX_EVENTS = 600;
const MAX_STRING = 300;
const MAX_DEPTH = 6;
const MAX_KEYS = 40;

type Obj = Record<string, unknown>;

function bad(path: string, why: string): never {
  throw new HttpError(400, "bad_session", `${path}: ${why}`);
}

/** Walks any JSON value: every number finite, every string short, bounded depth and width. */
function walk(v: unknown, path: string, depth: number): void {
  if (depth > MAX_DEPTH) bad(path, "nested too deeply");
  if (typeof v === "number") {
    if (!Number.isFinite(v)) bad(path, "must be a finite number");
  } else if (typeof v === "string") {
    if (v.length > MAX_STRING) bad(path, `longer than ${MAX_STRING} characters`);
  } else if (Array.isArray(v)) {
    if (v.length > MAX_EVENTS) bad(path, "too many entries");
    v.forEach((x, i) => walk(x, `${path}[${i}]`, depth + 1));
  } else if (v && typeof v === "object") {
    const keys = Object.keys(v);
    if (keys.length > MAX_KEYS) bad(path, "too many keys");
    for (const k of keys) walk((v as Obj)[k], `${path}.${k}`, depth + 1);
  }
}

function obj(v: unknown, path: string): Obj {
  if (!v || typeof v !== "object" || Array.isArray(v)) bad(path, "must be an object");
  return v as Obj;
}

function num(o: Obj, k: string, path: string, min = -1e6, max = 1e6): number {
  const v = o[k];
  if (typeof v !== "number") bad(`${path}.${k}`, "must be a number");
  if (v < min || v > max) bad(`${path}.${k}`, `must be between ${min} and ${max}`);
  return v;
}

function int(o: Obj, k: string, path: string, min: number, max: number): number {
  const v = num(o, k, path, min, max);
  if (!Number.isInteger(v)) bad(`${path}.${k}`, "must be a whole number");
  return v;
}

function numOrNull(o: Obj, k: string, path: string, min = -1e6, max = 1e6): number | null {
  if (o[k] === null) return null;
  return num(o, k, path, min, max);
}

function oneOf(o: Obj, k: string, path: string, allowed: string[]): string {
  const v = o[k];
  if (typeof v !== "string" || !allowed.includes(v)) bad(`${path}.${k}`, `must be one of ${allowed.join(", ")}`);
  return v;
}

function bool(o: Obj, k: string, path: string): boolean {
  if (typeof o[k] !== "boolean") bad(`${path}.${k}`, "must be true or false");
  return o[k] as boolean;
}

function field(v: unknown, path: string): void {
  const f = obj(v, path);
  oneOf(f, "endedBy", path, ENDED_BY);
  if (!Array.isArray(f.items)) bad(`${path}.items`, "must be a list");
  if (f.items.length > MAX_ITEMS) bad(`${path}.items`, `more than ${MAX_ITEMS} diyas`);
  f.items.forEach((it, i) => {
    const p = `${path}.items[${i}]`;
    const o = obj(it, p);
    int(o, "id", p, 0, 1e5);
    num(o, "x", p, -500, 500);
    num(o, "u", p, -500, 500);
    oneOf(o, "kind", p, ["whole", "chipped"]);
    if (o.chip !== null) oneOf(o, "chip", p, ["L", "R"]);
    oneOf(o, "side", p, ["L", "R"]);
  });
  if (!Array.isArray(f.events)) bad(`${path}.events`, "must be a list");
  if (f.events.length > MAX_EVENTS) bad(`${path}.events`, `more than ${MAX_EVENTS} pinches`);
  f.events.forEach((ev, i) => {
    const p = `${path}.events[${i}]`;
    const o = obj(ev, p);
    num(o, "t", p, 0, 3600);
    int(o, "id", p, 0, 1e5);
    oneOf(o, "r", p, RESULTS);
    num(o, "yaw", p, -180, 180);
  });
  for (const k of ["leftHits", "leftTotal", "rightHits", "rightTotal", "fpChipLeft", "fpChipRight", "revisits", "crossings"]) {
    int(f, k, path, 0, 1000);
  }
  if (num(f, "leftHits", path) > num(f, "leftTotal", path)) bad(`${path}.leftHits`, "more than leftTotal");
  if (num(f, "rightHits", path) > num(f, "rightTotal", path)) bad(`${path}.rightHits`, "more than rightTotal");
  num(f, "egoAsym", path, -1, 1);
  int(f, "alloAsym", path, -1000, 1000);
  numOrNull(f, "coc", path, -1, 1);
  numOrNull(f, "bestR", path, 0, 1);
  numOrNull(f, "meanStepCm", path, 0, 1000);
  if (!Array.isArray(f.timeByColumnS) || f.timeByColumnS.length !== 3) bad(`${path}.timeByColumnS`, "must be 3 numbers or nulls");
  f.timeByColumnS.forEach((t, i) => {
    if (t !== null && (typeof t !== "number" || t < 0)) bad(`${path}.timeByColumnS[${i}]`, "must be a number ≥ 0 or null");
  });
}

/** Throws HttpError(400) with a readable reason, or returns the session typed. */
export function validateSession(v: unknown): SessionJson {
  walk(v, "session", 0);
  const s = obj(v, "session");
  if (s.schema !== SCHEMA) bad("session.schema", `must be "${SCHEMA}"`);
  if (typeof s.sessionId !== "string" || !/^[A-Za-z0-9_-]{4,64}$/.test(s.sessionId)) {
    bad("session.sessionId", "must be 4-64 letters, digits, _ or -");
  }
  if (typeof s.lensVersion !== "string") bad("session.lensVersion", "must be text");
  if (typeof s.startedAt !== "string" || Number.isNaN(Date.parse(s.startedAt))) bad("session.startedAt", "must be an ISO date");
  num(s, "durationS", "session", 0, 7200);
  const st = obj(s.settings, "session.settings");
  oneOf(st, "preset", "session.settings", PRESETS);
  num(st, "hintDelayS", "session.settings", 0, 60);
  int(st, "beamStart", "session.settings", 0, 3);
  bool(st, "drift", "session.settings");
  bool(st, "far", "session.settings");
  int(st, "seed", "session.settings", 0, 2 ** 32);
  field(s.near, "session.near");
  if (s.far !== null) field(s.far, "session.far");
  if (s.drift !== null) {
    const d = obj(s.drift, "session.drift");
    for (const k of ["flickers", "hits", "misses"]) int(d, k, "session.drift", 0, 10000);
  }
  const h = obj(s.head, "session.head");
  num(h, "maxLeftDeg", "session.head", 0, 180);
  num(h, "maxRightDeg", "session.head", 0, 180);
  num(h, "pctTimeLeft", "session.head", 0, 1);
  const c = obj(s.cues, "session.cues");
  for (const k of ["hint1", "hint2", "beamEnd"]) int(c, k, "session.cues", 0, 10000);
  if (typeof s.summary !== "string" || s.summary.trim().length === 0) bad("session.summary", "must be text");
  return s as unknown as SessionJson;
}

export function validDeviceId(v: unknown): v is string {
  return typeof v === "string" && /^[0-9a-f]{32}$/.test(v);
}

/** Display name: 1-40 characters after trimming, no control characters. */
export function cleanName(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim().replace(/\s+/g, " ");
  if (s.length < 1 || s.length > 40) return null;
  if (/[\u0000-\u001f\u007f]/.test(s)) return null;
  return s;
}

export function cleanNote(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.replace(/\r\n/g, "\n").trim();
  if (s.length < 1 || s.length > 1000) return null;
  if (/[\u0000-\u0008\u000b-\u001f\u007f]/.test(s)) return null;
  return s;
}
