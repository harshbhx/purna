// Seeded random numbers (mulberry32). The same seed always gives the same layout,
// so LEAF scenarios and Node tests know exactly where every diya is.

export type Rand = () => number;

export function rng(seed: number): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle into a new array. */
export function shuffled<T>(items: T[], r: Rand): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

/** A short random id from a Rand, base36. */
export function randomId(r: Rand, length: number): string {
  let s = "";
  while (s.length < length) s += Math.floor(r() * 36).toString(36);
  return s;
}
