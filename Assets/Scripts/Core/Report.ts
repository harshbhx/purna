// The session report: the one JSON shape shared by the Lens, the Logger and Purna Family
// (purna.session.v1, docs/03-ARCHITECTURE.md §5), plus the plain-language summary.

import { FieldResult, HeadStats } from "./Metrics";
import { Preset } from "./PurnaTypes";

export const SESSION_SCHEMA = "purna.session.v1";
export const LENS_VERSION = "0.1.0";
export const LOG_PREFIX = "PURNA_SESSION ";

export interface DriftResult {
  flickers: number;
  hits: number;
  misses: number;
}

export interface SessionJson {
  schema: string;
  sessionId: string;
  lensVersion: string;
  startedAt: string;
  durationS: number;
  settings: { preset: Preset; hintDelayS: number; beamStart: number; drift: boolean; far: boolean; seed: number };
  near: FieldResult;
  far: FieldResult | null;
  drift: DriftResult | null;
  head: HeadStats;
  cues: { hint1: number; hint2: number; beamEnd: number };
  summary: string;
}

function hintsText(n: number): string {
  if (n === 0) return "No hints.";
  if (n === 1) return "1 hint.";
  return n + " hints.";
}

export function summarySentence(s: SessionJson): string {
  const n = s.near;
  let out =
    "Found " +
    n.leftHits +
    " of " +
    n.leftTotal +
    " on the left and " +
    n.rightHits +
    " of " +
    n.rightTotal +
    " on the right. ";
  if (s.far) {
    out +=
      "On the far board, " +
      s.far.leftHits +
      " of " +
      s.far.leftTotal +
      " left and " +
      s.far.rightHits +
      " of " +
      s.far.rightTotal +
      " right. ";
  }
  out += hintsText(s.cues.hint1 + s.cues.hint2);
  out += " Turned up to " + Math.round(s.head.maxLeftDeg) + "° left.";
  return out;
}

/** One Logger line: prefix + compact JSON. The web app's import box accepts it as is. */
export function logLine(s: SessionJson): string {
  return LOG_PREFIX + JSON.stringify(s);
}

/** Parses a Logger line or bare JSON back into a session (no validation beyond the schema tag). */
export function parseLogLine(text: string): SessionJson | null {
  const t = text.trim();
  const body = t.indexOf(LOG_PREFIX) === 0 ? t.slice(LOG_PREFIX.length) : t;
  try {
    const obj = JSON.parse(body) as SessionJson;
    return obj && obj.schema === SESSION_SCHEMA ? obj : null;
  } catch (e) {
    return null;
  }
}
