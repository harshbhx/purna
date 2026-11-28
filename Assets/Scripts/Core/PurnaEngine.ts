// The one object the Lens talks to. The Lens component (PurnaController) feeds it time, head yaw
// and pinches, and draws what it returns; the Node tests drive it with scripted players.
// Phases: setup -> [drift] -> near -> [far] -> replay. See docs/03-ARCHITECTURE.md §3.

import { CueTracker } from "./CueEngine";
import { DriftPlan, driftVisible, driftX, flickerAt, planDrift } from "./Drift";
import { generateLayout } from "./Layout";
import { FieldResult, PinchEvent, attentionMap, fieldResult, headStats } from "./Metrics";
import {
  Cue,
  EndedBy,
  FAR_FIELD,
  FAR_GAP_CM,
  FAR_SIZE_CM,
  Field,
  Item,
  NEAR_FIELD,
  PRESETS,
  Phase,
  PinchKind,
  Settings,
  Space,
  withDefaults,
} from "./PurnaTypes";
import { LENS_VERSION, SESSION_SCHEMA, SessionJson, summarySentence } from "./Report";

export interface DriftFrameItem {
  id: number;
  x: number;
  u: number;
  flicker: boolean;
}

export interface EngineFrame {
  phase: Phase;
  phaseChanged: boolean;
  cue: Cue;
  beamLevel: number;
  drift?: DriftFrameItem[];
}

type TaskPhase = "drift" | "near" | "far";

interface FieldState {
  field: Field;
  items: Item[];
  lit: number[]; // ids of lit whole diyas, in order
  touched: { [id: number]: boolean }; // chipped diyas already pinched
  events: PinchEvent[];
  endedBy: EndedBy | null;
}

/** Yaw samples are kept at most this often. */
export const YAW_SAMPLE_S = 0.1;

export class PurnaEngine {
  readonly settings: Settings;
  private _phase: Phase = "setup";
  private tasks: TaskPhase[] = [];
  private taskIndex = -1;
  private taskStartT = 0;
  private sessionStartT = 0;
  private endT: number | null = null;
  private lastT = 0;
  private lastYawSampleT = -Infinity;
  private yawSamples: { t: number; yaw: number }[] = [];
  private tableYaw: { yaw: number }[] = [];
  private cues: CueTracker;
  private fields: { [k in Space]: FieldState };
  private driftPlan: DriftPlan | null = null;
  private driftHitWindows: { [t0: string]: boolean } = {};
  private driftHits = 0;
  private driftMisses = 0;

  constructor(settings?: Partial<Settings>) {
    this.settings = withDefaults(settings);
    const p = PRESETS[this.settings.preset];
    const s = this.settings.seed;
    this.fields = {
      near: this.makeField(NEAR_FIELD, generateLayout(NEAR_FIELD, p.near, p.near, s, p.nearSizeCm, p.nearGapCm)),
      far: this.makeField(FAR_FIELD, this.settings.far ? generateLayout(FAR_FIELD, p.far, p.far, s, FAR_SIZE_CM, FAR_GAP_CM) : []),
    };
    this.cues = new CueTracker(this.settings.hintDelayS, this.settings.beamStart);
    if (this.settings.drift) {
      this.tasks.push("drift");
      this.driftPlan = planDrift(s, this.settings.driftS);
    }
    this.tasks.push("near");
    if (this.settings.far) this.tasks.push("far");
  }

  private makeField(field: Field, items: Item[]): FieldState {
    return { field, items, lit: [], touched: {}, events: [], endedBy: null };
  }

  get phase(): Phase {
    return this._phase;
  }
  get beamLevel(): number {
    return this.cues.beamLevel;
  }
  get hint1Count(): number {
    return this.cues.hint1Count;
  }
  get hint2Count(): number {
    return this.cues.hint2Count;
  }

  /** Current layout of a field (empty for the far board unless it's on). */
  items(space: Space): Item[] {
    return this.fields[space].items;
  }

  /** Ids of lit whole diyas on a field, in the order they were lit. */
  litIds(space: Space): number[] {
    return this.fields[space].lit.slice();
  }

  /** Seconds since the current task started (0 outside tasks). */
  taskTime(t: number): number {
    return this.isTask(this._phase) ? t - this.taskStartT : 0;
  }

  private isTask(p: Phase): p is TaskPhase {
    return p === "drift" || p === "near" || p === "far";
  }

  private frame(changed: boolean, cue: Cue): EngineFrame {
    const f: EngineFrame = { phase: this._phase, phaseChanged: changed, cue, beamLevel: this.cues.beamLevel };
    return f;
  }

  start(t: number): EngineFrame {
    if (this._phase !== "setup") return this.frame(false, "none");
    this.sessionStartT = t;
    this.lastT = t;
    this.enterTask(0, t);
    return this.frame(true, "none");
  }

  private enterTask(index: number, t: number): void {
    this.taskIndex = index;
    this._phase = this.tasks[index];
    this.taskStartT = t;
    if (this._phase === "near" || this._phase === "far") this.cues.startTask(t);
  }

  private limitFor(p: TaskPhase): number {
    return p === "drift" ? this.settings.driftS : p === "near" ? this.settings.nearS : this.settings.farS;
  }

  private endTask(t: number, endedBy: EndedBy): void {
    const p = this._phase;
    if (p === "near" || p === "far") this.fields[p].endedBy = endedBy;
    if (this.taskIndex + 1 < this.tasks.length) {
      this.enterTask(this.taskIndex + 1, t);
    } else {
      this._phase = "replay";
      this.endT = t;
    }
  }

  private darkLeftWhole(space: Space): number {
    const st = this.fields[space];
    let n = 0;
    for (const it of st.items) if (it.kind === "whole" && it.side === "L" && st.lit.indexOf(it.id) < 0) n++;
    return n;
  }

  private allWholeLit(space: Space): boolean {
    const st = this.fields[space];
    for (const it of st.items) if (it.kind === "whole" && st.lit.indexOf(it.id) < 0) return false;
    return true;
  }

  /** Call every frame with the current time and head yaw (degrees, positive = left). */
  tick(t: number, yawDeg: number): EngineFrame {
    this.lastT = t;
    const p = this._phase;
    if (!this.isTask(p)) return this.frame(false, "none");
    if (t - this.lastYawSampleT >= YAW_SAMPLE_S && isFinite(yawDeg)) {
      this.yawSamples.push({ t, yaw: yawDeg });
      if (p === "near") this.tableYaw.push({ yaw: yawDeg });
      this.lastYawSampleT = t;
    }
    const elapsed = t - this.taskStartT;
    if ((p === "near" || p === "far") && this.allWholeLit(p)) {
      this.endTask(t, "complete");
      return this.frame(true, "none");
    }
    if (elapsed >= this.limitFor(p)) {
      this.endTask(t, "timeout");
      return this.frame(true, "none");
    }
    if (p === "drift") {
      const f = this.frame(false, "none");
      f.drift = this.driftFrame(elapsed);
      return f;
    }
    const cue = this.cues.update(t, this.darkLeftWhole(p));
    return this.frame(false, cue);
  }

  private driftFrame(elapsed: number): DriftFrameItem[] {
    const plan = this.driftPlan;
    if (!plan) return [];
    const out: DriftFrameItem[] = [];
    for (const it of plan.items) {
      if (!driftVisible(plan, it, elapsed)) continue;
      out.push({ id: it.id, x: driftX(it, elapsed), u: it.u, flicker: flickerAt(plan, it.id, elapsed) !== null });
    }
    return out;
  }

  /** Ends the current task early (Finish / Done). */
  finish(t: number): EngineFrame {
    if (!this.isTask(this._phase)) return this.frame(false, "none");
    this.endTask(t, "finish");
    return this.frame(true, "none");
  }

  /** A pinch on an item. Returns what happened so the Lens can light, tick or do nothing. */
  pinch(t: number, itemId: number, yawDeg: number): PinchKind {
    const p = this._phase;
    if (p === "drift") {
      const plan = this.driftPlan;
      const w = plan ? flickerAt(plan, itemId, t - this.taskStartT) : null;
      if (w && !this.driftHitWindows[String(w.t0)]) {
        this.driftHitWindows[String(w.t0)] = true;
        this.driftHits++;
        return "drift-hit";
      }
      this.driftMisses++;
      return "drift-miss";
    }
    if (p !== "near" && p !== "far") return "ignored";
    const st = this.fields[p];
    let item: Item | null = null;
    for (const it of st.items) if (it.id === itemId) item = it;
    if (!item) return "ignored";
    const tt = t - this.taskStartT;
    const yaw = isFinite(yawDeg) ? yawDeg : 0;
    if (item.kind === "whole") {
      if (st.lit.indexOf(item.id) >= 0) {
        st.events.push({ t: tt, id: item.id, r: "revisit", yaw });
        return "revisit";
      }
      st.lit.push(item.id);
      st.events.push({ t: tt, id: item.id, r: "lit", yaw });
      this.cues.onLit(t, item.side);
      return "lit";
    }
    if (st.touched[item.id]) {
      st.events.push({ t: tt, id: item.id, r: "revisit", yaw });
      return "revisit";
    }
    st.touched[item.id] = true;
    st.events.push({ t: tt, id: item.id, r: "chipped", yaw });
    return "chipped";
  }

  /** The table's replay: lit order, and the whole diyas that were never lit. */
  replay(): { order: number[]; missed: number[] } {
    const st = this.fields.near;
    const missed: number[] = [];
    for (const it of st.items) if (it.kind === "whole" && st.lit.indexOf(it.id) < 0) missed.push(it.id);
    return { order: st.lit.slice(), missed };
  }

  private result(space: Space): FieldResult {
    const st = this.fields[space];
    return fieldResult(st.field, st.items, st.events, st.endedBy || "finish");
  }

  private head() {
    const h = headStats(this.yawSamples);
    h.attention = attentionMap(this.tableYaw, this.fields.near.field);
    return h;
  }

  /** Where the head pointed on the table so far (share of time per 5 cm strip, left first). For the Lens's light map. */
  attention(): number[] {
    return attentionMap(this.tableYaw, this.fields.near.field);
  }

  /** Builds the session JSON. Meant for the replay/report phase; works at any time for debugging. */
  report(startedAtIso: string, sessionId: string): SessionJson {
    const end = this.endT !== null ? this.endT : this.lastT;
    const s = this.settings;
    const json: SessionJson = {
      schema: SESSION_SCHEMA,
      sessionId,
      lensVersion: LENS_VERSION,
      startedAt: startedAtIso,
      durationS: Math.round((end - this.sessionStartT) * 10) / 10,
      settings: { preset: s.preset, hintDelayS: s.hintDelayS, beamStart: s.beamStart, drift: s.drift, far: s.far, seed: s.seed },
      near: this.result("near"),
      far: s.far ? this.result("far") : null,
      drift: s.drift ? { flickers: this.driftPlan ? this.driftPlan.flickers.length : 0, hits: this.driftHits, misses: this.driftMisses } : null,
      head: this.head(),
      cues: { hint1: this.cues.hint1Count, hint2: this.cues.hint2Count, beamEnd: this.cues.beamLevel },
      summary: "",
    };
    json.summary = summarySentence(json);
    return json;
  }
}

/** A session id like "s_lx3k9q_8f2a" from a timestamp (ms) and a random number in [0, 1). */
export function makeSessionId(nowMs: number, rand: number): string {
  return "s_" + Math.floor(nowMs).toString(36) + "_" + Math.floor(rand * 1679616).toString(36);
}
