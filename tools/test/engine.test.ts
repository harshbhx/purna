import { describe, expect, it } from "vitest";
import { PurnaEngine, makeSessionId } from "../../Assets/Scripts/Core/PurnaEngine";
import { Item } from "../../Assets/Scripts/Core/PurnaTypes";
import { LOG_PREFIX, SESSION_SCHEMA, logLine, parseLogLine } from "../../Assets/Scripts/Core/Report";

const ISO = "2026-12-03T09:30:12.000Z";
const whole = (items: Item[], side?: "L" | "R") => items.filter((i) => i.kind === "whole" && (!side || i.side === side));

describe("PurnaEngine phases", () => {
  it("setup -> near -> replay when every whole diya is lit", () => {
    const e = new PurnaEngine({ seed: 4127 });
    expect(e.phase).toBe("setup");
    const f0 = e.start(10);
    expect(f0.phaseChanged).toBe(true);
    expect(e.phase).toBe("near");
    expect(e.items("near").length).toBe(24);
    expect(e.items("far").length).toBe(0);
    let t = 10;
    for (const it of whole(e.items("near"))) {
      t += 1;
      e.tick(t, 0);
      expect(e.pinch(t, it.id, 0)).toBe("lit");
    }
    const f = e.tick(t + 0.02, 0);
    expect(f.phaseChanged).toBe(true);
    expect(e.phase).toBe("replay");
    const r = e.report(ISO, "s_a");
    expect(r.near.endedBy).toBe("complete");
    expect(r.near.leftHits).toBe(6);
    expect(r.near.rightHits).toBe(6);
    expect(r.durationS).toBeCloseTo(12, 1);
    expect(e.replay().missed).toEqual([]);
  });

  it("times out at nearS and keeps going to the far board when it's on", () => {
    const e = new PurnaEngine({ far: true, nearS: 90, farS: 60 });
    e.start(0);
    e.tick(89.9, 0);
    expect(e.phase).toBe("near");
    expect(e.tick(90, 0).phaseChanged).toBe(true);
    expect(e.phase).toBe("far");
    expect(e.items("far").length).toBe(16);
    const fw = whole(e.items("far"))[0];
    expect(e.pinch(91, fw.id, 0)).toBe("lit");
    e.tick(150, 0);
    expect(e.phase).toBe("replay");
    const r = e.report(ISO, "s_b");
    expect(r.near.endedBy).toBe("timeout");
    expect(r.far!.endedBy).toBe("timeout");
    expect(r.far!.leftHits + r.far!.rightHits).toBe(1);
    expect(r.summary).toContain("far board");
  });

  it("finish() ends the task early; pinches outside tasks are ignored", () => {
    const e = new PurnaEngine();
    expect(e.pinch(0, 0, 0)).toBe("ignored");
    expect(e.finish(0).phaseChanged).toBe(false);
    e.start(0);
    expect(e.pinch(1, 9999, 0)).toBe("ignored");
    e.finish(5);
    expect(e.phase).toBe("replay");
    expect(e.report(ISO, "s_c").near.endedBy).toBe("finish");
    expect(e.pinch(6, 0, 0)).toBe("ignored");
    expect(e.tick(7, 0).phaseChanged).toBe(false);
    expect(e.start(8).phaseChanged).toBe(false);
  });

  it("pinch results: lit, chipped, revisit", () => {
    const e = new PurnaEngine();
    e.start(0);
    const w = whole(e.items("near"))[0];
    const c = e.items("near").find((i) => i.kind === "chipped")!;
    expect(e.pinch(1, w.id, 0)).toBe("lit");
    expect(e.pinch(2, w.id, 0)).toBe("revisit");
    expect(e.pinch(3, c.id, 0)).toBe("chipped");
    expect(e.pinch(4, c.id, 0)).toBe("revisit");
    expect(e.litIds("near")).toEqual([w.id]);
    const r = e.report(ISO, "s_d");
    expect(r.near.events.map((x) => x.r)).toEqual(["lit", "revisit", "chipped", "revisit"]);
    expect(r.near.revisits).toBe(2);
  });

  it("hints fire through tick and reach the report", () => {
    const e = new PurnaEngine({ hintDelayS: 1 });
    e.start(0);
    const cues: string[] = [];
    for (let t = 0; t <= 3; t += 0.05) {
      const f = e.tick(t, 0);
      if (f.cue !== "none") cues.push(f.cue);
    }
    expect(cues).toEqual(["hint1", "hint2"]);
    // light every left whole diya: no more hints even though the right is dark
    for (const it of whole(e.items("near"), "L")) e.pinch(3.1, it.id, 20);
    for (let t = 3.1; t <= 10; t += 0.05) expect(e.tick(t, 0).cue).toBe("none");
    e.finish(10);
    const r = e.report(ISO, "s_e");
    expect(r.cues.hint1).toBe(1);
    expect(r.cues.hint2).toBe(1);
    expect(r.summary).toContain("2 hints.");
  });

  it("records yaw at most 10 times a second and reports head turns", () => {
    const e = new PurnaEngine();
    e.start(0);
    for (let t = 0; t < 2; t += 1 / 60) e.tick(t, t < 1 ? 25 * t : -10);
    e.finish(2);
    const r = e.report(ISO, "s_f");
    expect(r.head.maxLeftDeg).toBeGreaterThan(20);
    expect(r.head.maxRightDeg).toBe(10);
    expect(r.head.pctTimeLeft).toBeGreaterThan(0.3);
    expect(r.head.pctTimeLeft).toBeLessThan(0.5);
  });

  it("the replay lists lit order and missed whole diyas", () => {
    const e = new PurnaEngine();
    e.start(0);
    const ws = whole(e.items("near"));
    e.pinch(1, ws[3].id, 0);
    e.pinch(2, ws[1].id, 0);
    e.finish(3);
    const rp = e.replay();
    expect(rp.order).toEqual([ws[3].id, ws[1].id]);
    expect(rp.missed.length).toBe(ws.length - 2);
  });
});

describe("session JSON", () => {
  it("matches the purna.session.v1 shape and stays small", () => {
    const e = new PurnaEngine({ preset: "hard", far: true, drift: true, seed: 9 });
    e.start(0);
    let t = 0;
    while (e.phase !== "replay") {
      t += 0.5;
      const f = e.tick(t, Math.sin(t) * 30);
      if (e.phase === "near" || e.phase === "far") {
        for (const it of e.items(e.phase)) if (Math.floor(t * 2) % 7 === it.id % 7) e.pinch(t, it.id, 0);
      }
      if (f.phase === "drift" && f.drift && f.drift.length > 0) e.pinch(t, f.drift[0].id, 0);
    }
    const r = e.report(ISO, makeSessionId(Date.UTC(2026, 11, 3), 0.5));
    expect(r.schema).toBe(SESSION_SCHEMA);
    expect(r.sessionId).toMatch(/^s_[0-9a-z]+_[0-9a-z]+$/);
    expect(Object.keys(r).sort()).toEqual(
      ["schema", "sessionId", "lensVersion", "startedAt", "durationS", "settings", "near", "far", "drift", "head", "cues", "summary"].sort(),
    );
    expect(Object.keys(r.near).sort()).toEqual(
      [
        "endedBy", "items", "events", "leftHits", "leftTotal", "rightHits", "rightTotal", "fpChipLeft", "fpChipRight",
        "revisits", "egoAsym", "alloAsym", "coc", "bestR", "crossings", "meanStepCm", "timeByColumnS",
      ].sort(),
    );
    expect(r.settings).toEqual({ preset: "hard", hintDelayS: 6, beamStart: 3, drift: true, far: true, seed: 9 });
    const line = logLine(r);
    expect(line.startsWith(LOG_PREFIX)).toBe(true);
    expect(line.length).toBeLessThan(64 * 1024);
    expect(parseLogLine(line)).toEqual(r);
    expect(parseLogLine(JSON.stringify(r))).toEqual(r);
    expect(parseLogLine("garbage")).toBeNull();
    expect(parseLogLine('{"schema":"other"}')).toBeNull();
  });

  it("settings are validated and clamped", () => {
    const e = new PurnaEngine({ hintDelayS: 0, beamStart: 9, preset: "nope" as never, nearS: NaN });
    expect(e.settings.hintDelayS).toBe(0.5);
    expect(e.settings.beamStart).toBe(3);
    expect(e.settings.preset).toBe("standard");
    expect(e.settings.nearS).toBe(90);
  });
});
