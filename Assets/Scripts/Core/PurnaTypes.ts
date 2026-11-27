// Shared types and fixed numbers for Purna. Pure TypeScript: no Lens Studio globals,
// so the same file runs in the Lens and in the Node tests (tools/).
// Units: centimetres, seconds, degrees. The head starts at (0, 0, 0) looking down -z.

export type Side = "L" | "R";
export type ItemKind = "whole" | "chipped";
export type Space = "near" | "far";
export type Phase = "setup" | "drift" | "near" | "far" | "replay" | "report";
export type Cue = "none" | "hint1" | "hint2";
export type PinchKind = "lit" | "chipped" | "revisit" | "drift-hit" | "drift-miss" | "ignored";
export type EndedBy = "complete" | "timeout" | "finish";
export type Preset = "easy" | "standard" | "hard";

/** One diya on a field, in field-relative coordinates (docs/03-ARCHITECTURE.md §2). */
export interface Item {
  id: number;
  space: Space;
  x: number; // across the field, left negative
  u: number; // along the field's depth (table: + is nearer the user; board: + is up)
  kind: ItemKind;
  chip: Side | null; // which side of the diya is missing (object-centred), null if whole
  side: Side; // which half of the field it sits in (egocentric)
  sizeCm: number;
}

/** A rectangle the diyas sit on: the near table (flat) or the far board (upright). */
export interface Field {
  space: Space;
  centerX: number;
  centerY: number;
  centerZ: number;
  width: number;
  depth: number;
  upright: boolean;
  marginCm: number; // item centres stay this far inside the edges
  bandCm: number; // item centres stay this far from the centre line
}

export const NEAR_FIELD: Field = {
  space: "near",
  centerX: 0,
  centerY: -30,
  centerZ: -65,
  width: 70,
  depth: 45,
  upright: false,
  marginCm: 4,
  bandCm: 3,
};

export const FAR_FIELD: Field = {
  space: "far",
  centerX: 0,
  centerY: 0,
  centerZ: -200,
  width: 200,
  depth: 90,
  upright: true,
  marginCm: 12,
  bandCm: 9,
};

export interface PresetSpec {
  near: number; // whole diyas on the table (chipped = the same number)
  nearSizeCm: number;
  nearGapCm: number;
  far: number; // whole diyas on the board (chipped = the same number)
}

export const PRESETS: { [k in Preset]: PresetSpec } = {
  easy: { near: 8, nearSizeCm: 6, nearGapCm: 8, far: 6 },
  standard: { near: 12, nearSizeCm: 6, nearGapCm: 8, far: 8 },
  hard: { near: 16, nearSizeCm: 5, nearGapCm: 7, far: 10 },
};

export const FAR_SIZE_CM = 18;
export const FAR_GAP_CM = 22; // 24 cm can't fit Hard's 20 board diyas reliably; 22 fits every seed tested

export interface Settings {
  seed: number;
  preset: Preset;
  hintDelayS: number; // seconds stuck before Hint 1; Hint 2 after the same delay again
  beamStart: number; // 0 (off) .. 3 (full)
  drift: boolean;
  far: boolean;
  share: boolean;
  driftS: number;
  nearS: number;
  farS: number;
}

export const DEFAULT_SETTINGS: Settings = {
  seed: 4127,
  preset: "standard",
  hintDelayS: 6,
  beamStart: 3,
  drift: false,
  far: false,
  share: false,
  driftS: 45,
  nearS: 90,
  farS: 60,
};

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

export function withDefaults(s?: Partial<Settings>): Settings {
  const out: Settings = {
    seed: DEFAULT_SETTINGS.seed,
    preset: DEFAULT_SETTINGS.preset,
    hintDelayS: DEFAULT_SETTINGS.hintDelayS,
    beamStart: DEFAULT_SETTINGS.beamStart,
    drift: DEFAULT_SETTINGS.drift,
    far: DEFAULT_SETTINGS.far,
    share: DEFAULT_SETTINGS.share,
    driftS: DEFAULT_SETTINGS.driftS,
    nearS: DEFAULT_SETTINGS.nearS,
    farS: DEFAULT_SETTINGS.farS,
  };
  if (s) {
    if (typeof s.seed === "number" && isFinite(s.seed)) out.seed = Math.floor(s.seed);
    if (s.preset === "easy" || s.preset === "standard" || s.preset === "hard") out.preset = s.preset;
    if (typeof s.hintDelayS === "number" && isFinite(s.hintDelayS)) out.hintDelayS = s.hintDelayS;
    if (typeof s.beamStart === "number" && isFinite(s.beamStart)) out.beamStart = s.beamStart;
    if (typeof s.drift === "boolean") out.drift = s.drift;
    if (typeof s.far === "boolean") out.far = s.far;
    if (typeof s.share === "boolean") out.share = s.share;
    if (typeof s.driftS === "number" && isFinite(s.driftS)) out.driftS = s.driftS;
    if (typeof s.nearS === "number" && isFinite(s.nearS)) out.nearS = s.nearS;
    if (typeof s.farS === "number" && isFinite(s.farS)) out.farS = s.farS;
  }
  out.hintDelayS = clamp(out.hintDelayS, 0.5, 30);
  out.beamStart = Math.round(clamp(out.beamStart, 0, 3));
  out.driftS = clamp(out.driftS, 5, 300);
  out.nearS = clamp(out.nearS, 5, 600);
  out.farS = clamp(out.farS, 5, 600);
  return out;
}

/** Usable x range for item centres on a field. */
export function usableX(field: Field): { min: number; max: number } {
  const half = field.width / 2 - field.marginCm;
  return { min: -half, max: half };
}

/** Usable u range for item centres on a field. */
export function usableU(field: Field): { min: number; max: number } {
  const half = field.depth / 2 - field.marginCm;
  return { min: -half, max: half };
}

/** Which half an x position belongs to. Positions inside the band count as neither. */
export function sideOf(x: number, field: Field): Side | null {
  if (x < -field.bandCm) return "L";
  if (x > field.bandCm) return "R";
  return null;
}

/**
 * Head yaw in degrees from the camera's forward direction (x, z).
 * 0 = straight ahead (-z). Positive = turned LEFT. Range -180..180.
 */
export function yawFromForward(fx: number, fz: number): number {
  return (Math.atan2(-fx, -fz) * 180) / Math.PI;
}

/** World position (cm) of a field-relative point. */
export function toWorld(field: Field, x: number, u: number): { x: number; y: number; z: number } {
  if (field.upright) return { x: field.centerX + x, y: field.centerY + u, z: field.centerZ };
  return { x: field.centerX + x, y: field.centerY, z: field.centerZ + u };
}

export function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

export function round3(v: number): number {
  return Math.round(v * 1000) / 1000;
}
