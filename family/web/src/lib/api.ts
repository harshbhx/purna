// Tiny client for /api/v1. The family key lives only in localStorage and in invite-link fragments.
const KEY = "purna.familyKey";

export function getKey(): string | null {
  try { return localStorage.getItem(KEY); } catch { return null; }
}
export function setKey(k: string): boolean {
  try { localStorage.setItem(KEY, k); return true; } catch { return false; }
}
export function clearKey(): void {
  try { localStorage.removeItem(KEY); } catch { /* private mode */ }
}

export class ApiError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) {
    super(message);
  }
}

export async function api<T = unknown>(path: string, opts: { method?: string; body?: unknown; auth?: string | null } = {}): Promise<T> {
  const { method = "GET", body, auth } = opts;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (auth) headers.authorization = "Bearer " + auth;
  let r: Response;
  try {
    r = await fetch("/api/v1" + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, "offline", "Couldn't reach Purna. Check your connection and try again.");
  }
  if (r.status === 204) return null as T;
  let data: any = null;
  try { data = await r.json(); } catch { /* non-JSON */ }
  if (!r.ok) {
    const e = data && data.error;
    throw new ApiError(r.status, e ? e.code : "http_" + r.status, e ? e.message : `Something went wrong (${r.status}).`);
  }
  return data as T;
}

/** Reads `#k=...` or `#t=...` from the URL fragment, then removes it from the address bar. */
export function takeFragment(name: string): string | null {
  const m = new RegExp("(?:^|[#&])" + name + "=([A-Za-z0-9_-]{20,100})").exec(location.hash);
  if (!m) return null;
  history.replaceState(null, "", location.pathname + location.search);
  return m[1];
}

/** Accepts the raw JSON or the full Logger line starting with "PURNA_SESSION ". */
export function parseImport(text: unknown): unknown | null {
  let t = String(text ?? "").trim();
  const i = t.indexOf("PURNA_SESSION ");
  if (i >= 0) t = t.slice(i + "PURNA_SESSION ".length).trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start < 0 || end < start) return null;
  try { return JSON.parse(t.slice(start, end + 1)); } catch { return null; }
}
