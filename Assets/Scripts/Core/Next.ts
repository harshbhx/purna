// What to try next time, from the last few sessions. The setup panel preselects it; the carer can always change it.
// Rules are deliberately simple and explainable: two clean sessions in a row → a step harder; a hard session
// (under half the left found and 3+ hints) → a step easier; otherwise stay. "Harder" means a bigger table, then
// less help (a longer wait before the hint). Pure: no Lens globals, ES2019.
import { Preset } from "./PurnaTypes";
import { SessionJson } from "./Report";

/** The few numbers the Lens needs to keep from each session (small enough for persistent storage). */
export interface SessionBrief {
  preset: Preset;
  hintDelayS: number;
  leftHits: number;
  leftTotal: number;
  rightHits: number;
  rightTotal: number;
  hints: number;
}

export interface NextStep {
  preset: Preset;
  hintDelayS: number;
  change: "harder" | "easier" | "same" | "start" | "therapist";
  /** One short sentence for the setup panel, in the same plain words as the report card. */
  reason: string;
}

export const PRESET_ORDER: Preset[] = ["easy", "standard", "hard"];
/** The setup panel's hint delays, most help first. */
export const HINT_DELAYS = [4, 6, 10];

export function briefOf(s: SessionJson): SessionBrief {
  return {
    preset: s.settings.preset,
    hintDelayS: s.settings.hintDelayS,
    leftHits: s.near.leftHits,
    leftTotal: s.near.leftTotal,
    rightHits: s.near.rightHits,
    rightTotal: s.near.rightTotal,
    hints: s.cues.hint1 + s.cues.hint2,
  };
}

function clean(b: SessionBrief): boolean {
  return b.leftHits === b.leftTotal && b.rightHits === b.rightTotal && b.hints === 0;
}

function hard(b: SessionBrief): boolean {
  return b.leftTotal > 0 && b.leftHits / b.leftTotal < 0.5 && b.hints >= 3;
}

/** Nearest offered hint delay, so an odd stored value still steps sensibly. */
function delayIndex(d: number): number {
  let best = 0;
  for (let i = 1; i < HINT_DELAYS.length; i++) if (Math.abs(HINT_DELAYS[i] - d) < Math.abs(HINT_DELAYS[best] - d)) best = i;
  return best;
}

const NAME: { [k in Preset]: string } = { easy: "Easy", standard: "Standard", hard: "Hard" };

/** Suggests the next session's level and hint delay. `recentNewestFirst` may be empty. */
export function suggestNext(recentNewestFirst: SessionBrief[]): NextStep {
  const last = recentNewestFirst[0];
  if (!last) return { preset: "standard", hintDelayS: 6, change: "start", reason: "First practice: Standard, hint after 6 s." };
  const p = PRESET_ORDER.indexOf(last.preset);
  const d = delayIndex(last.hintDelayS);
  const prev = recentNewestFirst[1];
  const sameSetup = !!prev && prev.preset === last.preset && delayIndex(prev.hintDelayS) === d;

  if (sameSetup && clean(last) && clean(prev)) {
    if (p < PRESET_ORDER.length - 1) {
      const next = PRESET_ORDER[p + 1];
      return { preset: next, hintDelayS: HINT_DELAYS[d], change: "harder", reason: `Every diya found without hints, twice in a row. Try ${NAME[next]}.` };
    }
    if (d < HINT_DELAYS.length - 1) {
      return { preset: last.preset, hintDelayS: HINT_DELAYS[d + 1], change: "harder", reason: `Every diya found without hints, twice in a row. Try the hint after ${HINT_DELAYS[d + 1]} s.` };
    }
    return { preset: last.preset, hintDelayS: HINT_DELAYS[d], change: "same", reason: "Every diya found on the hardest setting. Keep going." };
  }

  if (hard(last)) {
    if (p > 0) {
      const next = PRESET_ORDER[p - 1];
      return { preset: next, hintDelayS: HINT_DELAYS[d], change: "easier", reason: `Last time was hard work. Try ${NAME[next]}.` };
    }
    if (d > 0) {
      return { preset: last.preset, hintDelayS: HINT_DELAYS[d - 1], change: "easier", reason: `Last time was hard work. Try the hint after ${HINT_DELAYS[d - 1]} s.` };
    }
    return { preset: last.preset, hintDelayS: HINT_DELAYS[d], change: "same", reason: "Same as last time. Easy, with the quickest hint." };
  }

  return { preset: last.preset, hintDelayS: HINT_DELAYS[d], change: "same", reason: `Same as last time: ${NAME[last.preset]}, hint after ${HINT_DELAYS[d]} s.` };
}

/** A next session chosen by the therapist from the doctor link (GET /api/v1/devices/:id/next). */
export interface TherapistPlan {
  preset: Preset;
  hintDelayS: number;
  /** When the therapist set it, ISO 8601. */
  setAt: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function validPlan(p: TherapistPlan | null | undefined): p is TherapistPlan {
  return !!p && PRESET_ORDER.indexOf(p.preset) >= 0 && typeof p.hintDelayS === "number" && isFinite(p.hintDelayS);
}

/**
 * What the setup panel preselects: the therapist's plan when there is one, otherwise suggestNext().
 * The carer can still change either. The server only returns a plan until the next session arrives.
 */
export function chooseNext(recentNewestFirst: SessionBrief[], plan?: TherapistPlan | null): NextStep {
  if (!validPlan(plan)) return suggestNext(recentNewestFirst);
  const delay = HINT_DELAYS[delayIndex(plan.hintDelayS)];
  const d = new Date(plan.setAt);
  const when = isNaN(d.getTime()) ? "" : " on " + d.getUTCDate() + " " + MONTHS[d.getUTCMonth()];
  return {
    preset: plan.preset,
    hintDelayS: delay,
    change: "therapist",
    reason: "Set by your therapist" + when + ": " + NAME[plan.preset] + ", hint after " + delay + " s.",
  };
}
