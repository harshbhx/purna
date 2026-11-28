// Daily clean-up (cron in wrangler.toml): keep data only as long as it's needed.
// - Sessions from glasses that were never paired: deleted 30 days after they arrived.
// - Unpaired glasses with no sessions left and an expired code: deleted.
// - Doctor links that expired or were stopped: their records deleted 30 days later (notes stay with the family).
// Paired families' sessions stay until the family presses "Delete everything".
import type { Env } from "./api";

export const UNPAIRED_KEEP_DAYS = 30;
export const ENDED_LINK_KEEP_DAYS = 30;
const DAY_MS = 24 * 3600 * 1000;

export interface CleanupResult { unpairedSessions: number; unpairedDevices: number; endedLinks: number }

export async function cleanup(env: Pick<Env, "DB">, now = Date.now()): Promise<CleanupResult> {
  const sessionCutoff = now - UNPAIRED_KEEP_DAYS * DAY_MS;
  const linkCutoff = now - ENDED_LINK_KEEP_DAYS * DAY_MS;
  const [s, d, l] = await env.DB.batch([
    env.DB.prepare("DELETE FROM sessions WHERE patient_id IS NULL AND received_at < ?").bind(sessionCutoff),
    env.DB.prepare(
      "DELETE FROM devices WHERE patient_id IS NULL AND (pair_expires_at IS NULL OR pair_expires_at < ?) AND NOT EXISTS (SELECT 1 FROM sessions WHERE sessions.device_id = devices.device_id)",
    ).bind(now),
    env.DB.prepare("DELETE FROM shares WHERE (revoked = 1 OR expires_at < ?) AND expires_at < ?").bind(now, linkCutoff),
  ]);
  return { unpairedSessions: s.meta.changes ?? 0, unpairedDevices: d.meta.changes ?? 0, endedLinks: l.meta.changes ?? 0 };
}
