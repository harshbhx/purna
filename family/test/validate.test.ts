// Unit tests for the session validator and input cleaners (docs/03-ARCHITECTURE.md §6.4).

import { describe, expect, it } from "vitest";
import { HttpError } from "../src/lib/http";
import { cleanName, cleanNote, validateSession, validDeviceId } from "../src/lib/validate";
import sample from "../samples/01-leftNeglect.json";

type J = Record<string, any>;
const fresh = (): J => structuredClone(sample);

function reason(s: unknown): string {
  try {
    validateSession(s);
    return "ok";
  } catch (e) {
    expect(e).toBeInstanceOf(HttpError);
    expect((e as HttpError).status).toBe(400);
    return (e as HttpError).message;
  }
}

describe("validateSession", () => {
  it("accepts a real engine session and returns it unchanged", () => {
    const s = fresh();
    expect(validateSession(s)).toBe(s);
  });

  it("accepts nulls where the schema allows them", () => {
    const s = fresh();
    s.near.coc = null;
    s.near.bestR = null;
    s.near.meanStepCm = null;
    s.near.timeByColumnS = [null, 1.2, null];
    expect(reason(s)).toBe("ok");
  });

  it("accepts optional far and drift blocks", () => {
    const s = fresh();
    s.far = structuredClone(s.near);
    s.drift = { flickers: 12, hits: 9, misses: 2 };
    expect(reason(s)).toBe("ok");
  });

  it("names the exact field that failed", () => {
    const s = fresh();
    s.near.events[0].yaw = 400;
    expect(reason(s)).toMatch(/^session\.near\.events\[0\]\.yaw: must be between -180 and 180/);
  });

  it.each([
    ["non-object", 42, /session: must be an object/],
    ["array", [], /session: must be an object/],
    ["null", null, /session: must be an object/],
  ])("rejects a %s session", (_, v, re) => {
    expect(reason(v)).toMatch(re);
  });

  it("rejects NaN and Infinity anywhere, even in unknown keys", () => {
    const a = fresh();
    a.near.egoAsym = Number.NaN;
    expect(reason(a)).toMatch(/finite/);
    const b = fresh();
    b.extra = { deep: [Number.POSITIVE_INFINITY] };
    expect(reason(b)).toMatch(/session\.extra\.deep\[0\]: must be a finite number/);
  });

  it("rejects deep nesting and very wide objects", () => {
    const a = fresh();
    a.x = { a: { b: { c: { d: { e: { f: { g: 1 } } } } } } };
    expect(reason(a)).toMatch(/nested too deeply/);
    const b = fresh();
    b.wide = Object.fromEntries(Array.from({ length: 41 }, (_, i) => ["k" + i, i]));
    expect(reason(b)).toMatch(/too many keys/);
  });

  it("rejects bad settings", () => {
    for (const [k, v] of [["beamStart", 4], ["beamStart", 1.5], ["drift", "yes"], ["hintDelayS", -1], ["seed", -3]] as const) {
      const s = fresh();
      s.settings[k] = v;
      expect(reason(s), `${k}=${v}`).not.toBe("ok");
    }
  });

  it("rejects bad items", () => {
    const mutations: ((it: J) => void)[] = [
      (it) => (it.kind = "broken"),
      (it) => (it.chip = "M"),
      (it) => (it.side = "C"),
      (it) => (it.id = -1),
      (it) => (it.x = 9999),
    ];
    for (const m of mutations) {
      const s = fresh();
      m(s.near.items[0]);
      expect(reason(s)).toMatch(/session\.near\.items\[0\]/);
    }
  });

  it("rejects out-of-range head and cue numbers", () => {
    const a = fresh();
    a.head.pctTimeLeft = 1.5;
    expect(reason(a)).toMatch(/pctTimeLeft/);
    const b = fresh();
    b.cues.hint1 = 2.5;
    expect(reason(b)).toMatch(/whole number/);
  });

  it("accepts a missing attention map (older Lens builds) and rejects a malformed one", () => {
    const old = fresh();
    delete old.head.attention;
    expect(() => validateSession(old)).not.toThrow();
    for (const bad of ["warm", [], new Array(33).fill(0), [0.5, 1.2], [0.5, Number.NaN], [-0.1]]) {
      const a = fresh();
      a.head.attention = bad;
      expect(reason(a)).toMatch(/session\.head\.attention/);
    }
  });

  it("rejects a malformed timeByColumnS", () => {
    const a = fresh();
    a.near.timeByColumnS = [1, 2];
    expect(reason(a)).toMatch(/3 numbers or nulls/);
    const b = fresh();
    b.near.timeByColumnS = [1, -2, 3];
    expect(reason(b)).toMatch(/timeByColumnS\[1\]/);
  });
});

describe("input cleaners", () => {
  it("validDeviceId wants exactly 32 lowercase hex", () => {
    expect(validDeviceId("0123456789abcdef0123456789abcdef")).toBe(true);
    expect(validDeviceId("0123456789ABCDEF0123456789ABCDEF")).toBe(false);
    expect(validDeviceId("0123")).toBe(false);
    expect(validDeviceId(123)).toBe(false);
  });

  it("cleanName trims, collapses spaces and caps at 40", () => {
    expect(cleanName("  Papa  ")).toBe("Papa");
    expect(cleanName("Ramesh \n  Bhai")).toBe("Ramesh Bhai");
    expect(cleanName("पापा")).toBe("पापा");
    expect(cleanName("")).toBeNull();
    expect(cleanName("x".repeat(41))).toBeNull();
    expect(cleanName("a\u0007b")).toBeNull();
    expect(cleanName(7)).toBeNull();
  });

  it("cleanNote keeps line breaks, caps at 1000, drops control characters", () => {
    expect(cleanNote("Line one\r\nLine two")).toBe("Line one\nLine two");
    expect(cleanNote("   ")).toBeNull();
    expect(cleanNote("x".repeat(1001))).toBeNull();
    expect(cleanNote("ok\u0000")).toBeNull();
    expect(cleanNote(null)).toBeNull();
  });
});
