// Purna's sounds, made from sine partials and seeded noise so they are original, reproducible and free of
// licences. docs/02-DESIGN.md §6 is the spec: warm, soft, short, no failure sound. Mono, so Lens Studio can
// spatialise them. `npm run sounds` writes Assets/Audio/*.wav; CI checks they are up to date.

export const SAMPLE_RATE = 48000;

export interface SoundSpec {
  /** File name in Assets/Audio. */
  file: string;
  /** What it is for, from the design doc. */
  use: string;
  /** Length in seconds. */
  seconds: number;
  /** Loudest sample, in dB below full scale. */
  peakDb: number;
  /** Fills the buffer with the raw waveform (any scale); `make` normalises it. */
  synth(out: Float64Array, rand: () => number): void;
}

/** Small seeded PRNG (mulberry32) so noise is the same on every run. */
export function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TAU = Math.PI * 2;

/** Adds a decaying sine partial: frequency (Hz), amplitude, decay time constant (s), start (s), phase. */
function partial(out: Float64Array, hz: number, amp: number, tau: number, start = 0, phase = 0): void {
  const s0 = Math.floor(start * SAMPLE_RATE);
  for (let i = s0; i < out.length; i++) {
    const t = (i - s0) / SAMPLE_RATE;
    out[i] += amp * Math.exp(-t / tau) * Math.sin(TAU * hz * t + phase);
  }
}

/** Adds a short noise burst through a one-pole filter: lowpass if `hp` is false, else highpass. */
function burst(out: Float64Array, rand: () => number, amp: number, tau: number, cutoffHz: number, hp: boolean): void {
  const k = Math.exp((-TAU * cutoffHz) / SAMPLE_RATE);
  let lp = 0;
  const n = Math.min(out.length, Math.floor(tau * 8 * SAMPLE_RATE));
  for (let i = 0; i < n; i++) {
    const x = rand() * 2 - 1;
    lp = (1 - k) * x + k * lp;
    out[i] += amp * Math.exp(-i / SAMPLE_RATE / tau) * (hp ? x - lp : lp);
  }
}

/** Raised-cosine fade in over `attack` s and fade out over `release` s, so no file starts or ends with a click. */
function fades(out: Float64Array, attack: number, release: number): void {
  const a = Math.max(1, Math.floor(attack * SAMPLE_RATE));
  const r = Math.max(1, Math.floor(release * SAMPLE_RATE));
  for (let i = 0; i < out.length; i++) {
    let g = 1;
    if (i < a) g *= 0.5 - 0.5 * Math.cos((Math.PI * i) / a);
    const fromEnd = out.length - 1 - i;
    if (fromEnd < r) g *= 0.5 - 0.5 * Math.cos((Math.PI * fromEnd) / r);
    out[i] *= g;
  }
}

export const SOUNDS: SoundSpec[] = [
  {
    file: "light.wav",
    use: "A whole diya lights: a warm tone like a small brass bowl, at the diya",
    seconds: 0.4,
    peakDb: -6,
    synth(out) {
      // Singing-bowl partials over 660 Hz, with a slow beat from a slightly detuned twin.
      partial(out, 660, 1, 0.3);
      partial(out, 661.6, 0.45, 0.3, 0, 1.1);
      partial(out, 660 * 2.71, 0.3, 0.14, 0, 0.4);
      partial(out, 660 * 5.15, 0.08, 0.06, 0, 2.2);
      fades(out, 0.015, 0.04);
    },
  },
  {
    file: "tick.wav",
    use: "A chipped diya is pinched: a quiet wooden tick, nothing else",
    seconds: 0.08,
    peakDb: -14,
    synth(out, rand) {
      partial(out, 1900, 1, 0.009);
      partial(out, 3400, 0.4, 0.004, 0, 0.7);
      burst(out, rand, 0.5, 0.0025, 2500, false);
      fades(out, 0.001, 0.015);
    },
  },
  {
    file: "bell.wav",
    use: "The hint: one strike of a soft temple bell, from the table's left edge",
    seconds: 1.8,
    peakDb: -3,
    synth(out, rand) {
      // Bell partials over 784 Hz (hum, prime, minor third, fifth, nominal, upper partials) with beating pairs.
      const f = 784;
      const ratios: [number, number][] = [
        [0.5, 0.25], [1, 1], [1.19, 0.45], [1.5, 0.3], [2, 0.6], [2.5, 0.2], [2.66, 0.18], [3.01, 0.12], [4.1, 0.08], [5.4, 0.05],
      ];
      // Lower partials ring longer; everything is down about 40 dB by 1.5 s, per the design doc.
      ratios.forEach(([r, a], j) => partial(out, f * r, a, 0.3 * Math.pow(1 / r, 0.5), 0, j * 0.9));
      partial(out, f + 1.3, 0.4, 0.3, 0, 2.0);
      partial(out, f * 2 + 2.1, 0.25, 0.22, 0, 0.3);
      burst(out, rand, 0.35, 0.004, 3000, true);
      fades(out, 0.002, 0.06);
    },
  },
  {
    file: "ui.wav",
    use: "Buttons on the setup panel and report card: a soft click",
    seconds: 0.05,
    peakDb: -16,
    synth(out, rand) {
      partial(out, 2400, 1, 0.006);
      burst(out, rand, 0.25, 0.0015, 4000, false);
      fades(out, 0.001, 0.012);
    },
  },
  {
    file: "replay.wav",
    use: "Optional: a very soft shimmer for each segment of the replay thread",
    seconds: 0.35,
    peakDb: -20,
    synth(out, rand) {
      [2093, 2637, 3136, 3951, 4186].forEach((hz, j) => partial(out, hz, 1 - j * 0.12, 0.12, j * 0.012, rand() * TAU));
      fades(out, 0.02, 0.08);
    },
  },
];

/** Renders one sound, normalised so its loudest sample sits exactly at `peakDb`. */
export function render(spec: SoundSpec, seed = 2026): Float64Array {
  const out = new Float64Array(Math.round(spec.seconds * SAMPLE_RATE));
  spec.synth(out, prng(seed));
  let peak = 0;
  for (const v of out) peak = Math.max(peak, Math.abs(v));
  const g = Math.pow(10, spec.peakDb / 20) / peak;
  for (let i = 0; i < out.length; i++) out[i] *= g;
  return out;
}

/** 16-bit PCM mono WAV bytes. */
export function wav(samples: Float64Array): Uint8Array {
  const data = samples.length * 2;
  const buf = new ArrayBuffer(44 + data);
  const v = new DataView(buf);
  const str = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, "RIFF"); v.setUint32(4, 36 + data, true); str(8, "WAVE");
  str(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, SAMPLE_RATE, true); v.setUint32(28, SAMPLE_RATE * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  str(36, "data"); v.setUint32(40, data, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(44 + i * 2, Math.round(s < 0 ? s * 32768 : s * 32767), true);
  }
  return new Uint8Array(buf);
}
