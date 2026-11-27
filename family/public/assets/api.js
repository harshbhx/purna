// Tiny client for /api/v1. The family key lives only in localStorage and in invite-link fragments.

const KEY = "purna.familyKey";

export function getKey() {
  try { return localStorage.getItem(KEY); } catch { return null; }
}
export function setKey(k) {
  try { localStorage.setItem(KEY, k); return true; } catch { return false; }
}
export function clearKey() {
  try { localStorage.removeItem(KEY); } catch { /* private mode */ }
}

export class ApiError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}

/**
 * @param {string} path  e.g. "/me"
 * @param {{ method?: string, body?: unknown, auth?: string | null }} [opts]
 */
export async function api(path, { method = "GET", body, auth } = {}) {
  const headers = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (auth) headers.authorization = "Bearer " + auth;
  let r;
  try {
    r = await fetch("/api/v1" + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, "offline", "Couldn't reach Purna. Check your connection and try again.");
  }
  if (r.status === 204) return null;
  let data = null;
  try { data = await r.json(); } catch { /* non-JSON */ }
  if (!r.ok) {
    const e = data && data.error;
    throw new ApiError(r.status, e ? e.code : "http_" + r.status, e ? e.message : "Something went wrong (" + r.status + ").");
  }
  return data;
}

/** Reads `#k=...` or `#t=...` from the URL fragment, then removes it from the address bar. */
export function takeFragment(name) {
  const m = new RegExp("(?:^|[#&])" + name + "=([A-Za-z0-9_-]{20,100})").exec(location.hash);
  if (!m) return null;
  history.replaceState(null, "", location.pathname + location.search);
  return m[1];
}

/** Accepts the raw JSON or the full Logger line starting with "PURNA_SESSION ". */
export function parseImport(text) {
  let t = String(text || "").trim();
  const i = t.indexOf("PURNA_SESSION ");
  if (i >= 0) t = t.slice(i + "PURNA_SESSION ".length).trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start < 0 || end < start) return null;
  try { return JSON.parse(t.slice(start, end + 1)); } catch { return null; }
}
