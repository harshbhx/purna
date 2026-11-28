// Rate limits on the three routes anyone can reach without a family key.
// Cloudflare's Rate Limiting binding counts per location and is approximate, so these slow down guessing and
// floods; they are not exact quotas. Bindings are declared in wrangler.toml ([[ratelimits]]).
import { HttpError } from "./http";

export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export const RETRY_AFTER_S = 60;

/**
 * Who is asking, for a route with no other identity. Cloudflare sets CF-Connecting-IP on every request that
 * reaches the Worker and overwrites any value a client sends, so it can't be forged in production. Without it
 * (local dev and tests that don't set it) there is no caller to count, and the IP limit doesn't apply.
 */
export function callerIp(req: Request): string | null {
  const ip = req.headers.get("cf-connecting-ip");
  return ip && ip.length <= 64 ? ip : null;
}

/** Throws a plain-language 429 when the limiter says this key has had enough for now. */
export async function enforce(limiter: RateLimiter, key: string): Promise<void> {
  const { success } = await limiter.limit({ key });
  if (!success) throw new HttpError(429, "slow_down", "Too many tries in a short time. Wait a minute and try again.");
}
