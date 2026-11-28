// Purna's sounds against docs/02-DESIGN.md §6: short, soft, mono, no clicks, and the right character.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { render, SAMPLE_RATE, SOUNDS, wav } from "../scripts/sounds";

const byFile = Object.fromEntries(SOUNDS.map((s) => [s.file, s]));
const db = (x: number) => 20 * Math.log10(x);
const peak = (a: Float64Array) => a.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
const rms = (a: Float64Array, from: number, to: number) => {
  let s = 0;
  const i0 = Math.floor(from * SAMPLE_RATE), i1 = Math.min(a.length, Math.floor(to * SAMPLE_RATE));
  for (let i = i0; i < i1; i++) s += a[i] * a[i];
  return Math.sqrt(s / Math.max(1, i1 - i0));
};
/** Energy at one frequency (Goertzel) over the first `seconds`. */
const power = (a: Float64Array, hz: number, seconds: number) => {
  const n = Math.floor(seconds * SAMPLE_RATE), w = (2 * Math.PI * hz) / SAMPLE_RATE, c = 2 * Math.cos(w);
  let s1 = 0, s2 = 0;
  for (let i = 0; i < n; i++) { const s0 = a[i] + c * s1 - s2; s2 = s1; s1 = s0; }
  return s1 * s1 + s2 * s2 - c * s1 * s2;
};
const loudestHz = (a: Float64Array, lo: number, hi: number, step: number, seconds: number) => {
  let best = lo, bp = -1;
  for (let f = lo; f <= hi; f += step) { const p = power(a, f, seconds); if (p > bp) { bp = p; best = f; } }
  return best;
};

describe("every sound", () => {
  for (const s of SOUNDS) {
    it(`${s.file}: right length, exact peak, no clipping, no click at either end`, () => {
      const a = render(s);
      expect(a.length).toBe(Math.round(s.seconds * SAMPLE_RATE));
      expect(db(peak(a))).toBeCloseTo(s.peakDb, 6);
      expect(peak(a)).toBeLessThan(1);
      expect(Math.abs(a[0])).toBeLessThan(1e-3);
      expect(Math.abs(a[a.length - 1])).toBeLessThan(1e-4);
    });
  }

  it("is soft: nothing louder than −3 dBFS, and the tick and click stay quiet", () => {
    for (const s of SOUNDS) expect(s.peakDb).toBeLessThanOrEqual(-3);
    expect(byFile["tick.wav"].peakDb).toBeLessThanOrEqual(-12);
    expect(byFile["ui.wav"].peakDb).toBeLessThanOrEqual(-12);
  });

  it("renders the same bytes every time (CI checks the committed files)", () => {
    for (const s of SOUNDS) expect(wav(render(s))).toEqual(wav(render(s)));
  });

  it("matches the committed files in Assets/Audio", () => {
    for (const s of SOUNDS) {
      const committed = new Uint8Array(readFileSync(new URL(`../../Assets/Audio/${s.file}`, import.meta.url)));
      expect(committed).toEqual(wav(render(s)));
    }
  });
});

describe("character, per the design doc", () => {
  it("light: a warm tone centred near 660 Hz, 0.4 s, with a gentle (not instant) attack", () => {
    const a = render(byFile["light.wav"]);
    expect(Math.abs(loudestHz(a, 200, 3000, 5, 0.2) - 660)).toBeLessThanOrEqual(5);
    expect(byFile["light.wav"].seconds).toBe(0.4);
    const firstMs = rms(a, 0, 0.001), at20ms = rms(a, 0.015, 0.025);
    expect(firstMs).toBeLessThan(at20ms / 10);
  });

  it("tick: 80 ms at most, bright and dry, nearly silent by 40 ms", () => {
    const a = render(byFile["tick.wav"]);
    expect(byFile["tick.wav"].seconds).toBeLessThanOrEqual(0.08);
    expect(loudestHz(a, 500, 5000, 50, 0.03)).toBeGreaterThan(1500);
    expect(db(rms(a, 0.04, 0.08) / rms(a, 0, 0.01))).toBeLessThan(-30);
  });

  it("bell: one strike that has faded by about 1.5 s, lower and longer than the light tone", () => {
    const a = render(byFile["bell.wav"]);
    const start = rms(a, 0.01, 0.06);
    expect(db(rms(a, 0.5, 0.6) / start)).toBeLessThan(-6);
    expect(db(rms(a, 1.45, 1.55) / start)).toBeLessThan(-40);
    expect(Math.abs(loudestHz(a, 300, 3000, 2, 0.4) - 784)).toBeLessThanOrEqual(4);
    expect(byFile["bell.wav"].seconds).toBeGreaterThan(byFile["light.wav"].seconds * 3);
  });

  it("ui: a click under 60 ms; replay: a soft high shimmer, the quietest sound", () => {
    expect(byFile["ui.wav"].seconds).toBeLessThan(0.06);
    const r = render(byFile["replay.wav"]);
    expect(loudestHz(r, 1000, 6000, 10, 0.2)).toBeGreaterThan(2000);
    expect(Math.min(...SOUNDS.map((s) => s.peakDb))).toBe(byFile["replay.wav"].peakDb);
  });

  it("writes a valid 16-bit mono 48 kHz WAV header", () => {
    const b = wav(render(byFile["tick.wav"]));
    const v = new DataView(b.buffer);
    const tag = (o: number) => String.fromCharCode(...b.slice(o, o + 4));
    expect([tag(0), tag(8), tag(12), tag(36)]).toEqual(["RIFF", "WAVE", "fmt ", "data"]);
    expect(v.getUint16(22, true)).toBe(1);
    expect(v.getUint32(24, true)).toBe(48000);
    expect(v.getUint16(34, true)).toBe(16);
    expect(v.getUint32(40, true)).toBe(b.length - 44);
  });
});
