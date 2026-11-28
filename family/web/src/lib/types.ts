// The session contract is defined once, in Core. The web app only imports its types.
export type { SessionJson } from "../../../../Assets/Scripts/Core/Report";
import type { SessionJson } from "../../../../Assets/Scripts/Core/Report";

export type FieldResult = SessionJson["near"];
export type ItemJson = FieldResult["items"][number];

export interface SessionCard {
  id: string;
  startedAt: string;
  preset: string;
  summary: string;
  leftHits: number;
  leftTotal: number;
  rightHits: number;
  rightTotal: number;
  leftPct: number | null;
  rightPct: number | null;
  coc: number | null;
  hints: number;
  maxLeftDeg: number;
  endedBy: string;
}
export interface Note { id: string; text: string; createdAt: string }
export interface Share { id: string; expiresAt: string; createdAt: string }
/** The next session the therapist set from the doctor link. The next session from the glasses uses it up. */
export interface Plan { preset: "easy" | "standard" | "hard"; hintDelayS: number; setAt: string }
export interface Me { patient: { name: string; createdAt?: string }; sessions: SessionCard[]; notes: Note[]; shares: Share[]; plan?: Plan | null }
export interface DoctorData { patient: { name: string }; expiresAt: string; sessions: SessionJson[]; notes: Note[]; plan?: Plan | null }
