// Hint timing and beam fading (docs/01-PRD.md L4-L6).
// A "stuck spell" starts at task start or at the last lit diya. While whole diyas on the left are
// still dark: Hint 1 after `delay` seconds, Hint 2 after 2 x `delay`, then silence until a diya is lit.
// Hints only point to the side; nothing here knows which diya is missing, on purpose.

import { Cue, Side, clamp } from "./PurnaTypes";

/** 0 = no hint due, 1 = Hint 1 due, 2 = Hint 2 due. Pure function of the stuck time. */
export function cueLevel(idleS: number, darkLeftWhole: number, delayS: number): 0 | 1 | 2 {
  if (darkLeftWhole <= 0) return 0;
  if (idleS >= 2 * delayS) return 2;
  if (idleS >= delayS) return 1;
  return 0;
}

/** Left finds without a hint needed before the beam dims one step. */
export const UNCUED_LEFT_FINDS_PER_STEP = 4;

export class CueTracker {
  private delayS: number;
  private lastLitT = 0;
  private spellLevel: 0 | 1 | 2 = 0;
  private uncuedLeftStreak = 0;
  private beam: number;
  private h1 = 0;
  private h2 = 0;

  constructor(delayS: number, beamStart: number) {
    this.delayS = delayS;
    this.beam = Math.round(clamp(beamStart, 0, 3));
  }

  get beamLevel(): number {
    return this.beam;
  }
  get hint1Count(): number {
    return this.h1;
  }
  get hint2Count(): number {
    return this.h2;
  }
  /** True while the current stuck spell has already had a hint. */
  get hintedThisSpell(): boolean {
    return this.spellLevel > 0;
  }

  /** A new task (table or board) begins: a fresh stuck spell. Beam level carries over. */
  startTask(t: number): void {
    this.lastLitT = t;
    this.spellLevel = 0;
    this.uncuedLeftStreak = 0;
  }

  /** A whole diya was lit. Ends the stuck spell; may dim the beam. */
  onLit(t: number, side: Side): void {
    if (side === "L") {
      if (this.spellLevel === 0) {
        this.uncuedLeftStreak++;
        if (this.uncuedLeftStreak >= UNCUED_LEFT_FINDS_PER_STEP) {
          this.beam = Math.max(0, this.beam - 1);
          this.uncuedLeftStreak = 0;
        }
      } else {
        this.uncuedLeftStreak = 0;
      }
    }
    this.lastLitT = t;
    this.spellLevel = 0;
  }

  /** Call every frame. Returns "hint1"/"hint2" only on the frame the hint fires. */
  update(t: number, darkLeftWhole: number): Cue {
    const due = cueLevel(t - this.lastLitT, darkLeftWhole, this.delayS);
    if (due <= this.spellLevel) return "none";
    if (this.spellLevel === 0) {
      this.spellLevel = 1;
      this.h1++;
      this.beam = Math.min(3, this.beam + 1);
      return "hint1";
    }
    this.spellLevel = 2;
    this.h2++;
    return "hint2";
  }
}
