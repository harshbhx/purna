// Geometry and statistics for the search path: how orderly it was, and how often it crossed itself.

export interface Pt {
  x: number;
  u: number;
}

/** Pearson correlation. Returns 0 when it is undefined (fewer than 2 points or no variance). */
export function pearson(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  let ma = 0;
  let mb = 0;
  for (let i = 0; i < n; i++) {
    ma += a[i];
    mb += b[i];
  }
  ma /= n;
  mb /= n;
  let cov = 0;
  let va = 0;
  let vb = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - ma;
    const db = b[i] - mb;
    cov += da * db;
    va += da * da;
    vb += db * db;
  }
  if (va <= 1e-12 || vb <= 1e-12) return 0;
  return cov / Math.sqrt(va * vb);
}

function orient(a: Pt, b: Pt, c: Pt): number {
  return (b.x - a.x) * (c.u - a.u) - (b.u - a.u) * (c.x - a.x);
}

/** True only for a proper crossing (the segments cross at a point inside both). */
export function segmentsIntersect(p1: Pt, p2: Pt, p3: Pt, p4: Pt): boolean {
  const d1 = orient(p3, p4, p1);
  const d2 = orient(p3, p4, p2);
  const d3 = orient(p1, p2, p3);
  const d4 = orient(p1, p2, p4);
  const eps = 1e-9;
  return ((d1 > eps && d2 < -eps) || (d1 < -eps && d2 > eps)) && ((d3 > eps && d4 < -eps) || (d3 < -eps && d4 > eps));
}

/** Number of times a path (points in visiting order) crosses itself. Adjacent segments never count. */
export function countCrossings(points: Pt[]): number {
  let n = 0;
  for (let i = 0; i + 1 < points.length; i++) {
    for (let j = i + 2; j + 1 < points.length; j++) {
      if (segmentsIntersect(points[i], points[i + 1], points[j], points[j + 1])) n++;
    }
  }
  return n;
}

/** The larger of |r(order, x)| and |r(order, u)|. Null with fewer than 3 points. */
export function bestR(points: Pt[]): number | null {
  if (points.length < 3) return null;
  const order = points.map((_, i) => i);
  const rx = Math.abs(pearson(order, points.map((p) => p.x)));
  const ru = Math.abs(pearson(order, points.map((p) => p.u)));
  return Math.max(rx, ru);
}

/** Mean distance between consecutive points. Null with fewer than 2 points. */
export function meanStep(points: Pt[]): number | null {
  if (points.length < 2) return null;
  let s = 0;
  for (let i = 1; i < points.length; i++) s += Math.hypot(points[i].x - points[i - 1].x, points[i].u - points[i - 1].u);
  return s / (points.length - 1);
}
