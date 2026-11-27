// Small JSON helpers shared by every route.

export const MAX_BODY_BYTES = 64 * 1024;

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

const BASE_HEADERS: Record<string, string> = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
};

export function json(status: number, body: unknown, extra: Record<string, string> = {}): Response {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { ...BASE_HEADERS, ...extra },
  });
}

export function errorResponse(e: HttpError, extra: Record<string, string> = {}): Response {
  return json(e.status, { error: { code: e.code, message: e.message } }, extra);
}

/** Reads a JSON object body with a hard size cap. Never trusts Content-Length alone. */
export async function readJson(req: Request): Promise<Record<string, unknown>> {
  const ct = req.headers.get("content-type") ?? "";
  if (!ct.toLowerCase().startsWith("application/json")) {
    throw new HttpError(415, "bad_content_type", "Send JSON with Content-Type: application/json.");
  }
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY_BYTES) throw new HttpError(413, "too_large", "Body is larger than 64 KB.");
  const buf = await req.arrayBuffer();
  if (buf.byteLength > MAX_BODY_BYTES) throw new HttpError(413, "too_large", "Body is larger than 64 KB.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(buf));
  } catch {
    throw new HttpError(400, "bad_json", "Body is not valid JSON.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new HttpError(400, "bad_json", "Body must be a JSON object.");
  }
  return parsed as Record<string, unknown>;
}

export function bearer(req: Request): string | null {
  const h = req.headers.get("authorization") ?? "";
  const m = /^Bearer ([A-Za-z0-9_-]{20,100})$/.exec(h.trim());
  return m ? m[1] : null;
}
