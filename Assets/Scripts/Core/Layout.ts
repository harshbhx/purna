// Places whole and chipped diyas on a field. Deterministic from a seed.
// Rules (docs/01-PRD.md L2): whole diyas split exactly half left / half right; chipped diyas split
// half per side and, inside each side, as evenly as possible between gap-on-left and gap-on-right
// (totals always equal); centres keep the margin, the centre band and a minimum gap.
// Uses best-candidate sampling so diyas spread evenly, like a printed cancellation sheet.

import { Field, Item, ItemKind, Side, usableU, usableX } from "./PurnaTypes";
import { Rand, rng, shuffled } from "./Rng";

interface Slot {
  kind: ItemKind;
  chip: Side | null;
  side: Side;
}

const CANDIDATES = 24; // candidates tried per item; the one farthest from its neighbours wins
const MAX_DRAWS = 600; // give up on this attempt after this many draws for one item
const RESEEDS = 20;

/** Builds the list of what goes where (side + kind + chip), before positions. */
export function planSlots(whole: number, chipped: number): Slot[] {
  if (whole % 2 !== 0 || chipped % 2 !== 0) throw new Error("whole and chipped counts must be even");
  const slots: Slot[] = [];
  const sides: Side[] = ["L", "R"];
  for (const side of sides) {
    for (let i = 0; i < whole / 2; i++) slots.push({ kind: "whole", chip: null, side });
  }
  // Chipped: per side, alternate gap sides. Side L starts with a left gap, side R with a right gap,
  // so odd counts per side still give equal totals overall.
  const perSide = chipped / 2;
  for (const side of sides) {
    for (let i = 0; i < perSide; i++) {
      const first: Side = side === "L" ? "L" : "R";
      const other: Side = first === "L" ? "R" : "L";
      slots.push({ kind: "chipped", chip: i % 2 === 0 ? first : other, side });
    }
  }
  return slots;
}

function tryPlace(field: Field, slots: Slot[], sizeCm: number, gapCm: number, r: Rand): Item[] | null {
  const ux = usableX(field);
  const uu = usableU(field);
  const placed: Item[] = [];
  const order = shuffled(slots, r);
  for (let i = 0; i < order.length; i++) {
    const slot = order[i];
    const xMin = slot.side === "L" ? ux.min : field.bandCm;
    const xMax = slot.side === "L" ? -field.bandCm : ux.max;
    let best: { x: number; u: number; d: number } | null = null;
    let found = 0;
    for (let draw = 0; draw < MAX_DRAWS && found < CANDIDATES; draw++) {
      const x = xMin + r() * (xMax - xMin);
      const u = uu.min + r() * (uu.max - uu.min);
      let nearest = Infinity;
      for (const p of placed) {
        const d = Math.hypot(p.x - x, p.u - u);
        if (d < nearest) nearest = d;
      }
      if (nearest < gapCm) continue;
      found++;
      if (!best || nearest > best.d) best = { x, u, d: nearest };
    }
    if (!best) return null;
    placed.push({
      id: 0,
      space: field.space,
      x: best.x,
      u: best.u,
      kind: slot.kind,
      chip: slot.chip,
      side: slot.side,
      sizeCm,
    });
  }
  // Ids in a shuffled order so an id never hints at kind or side.
  const ids = shuffled(
    placed.map((_, i) => i),
    r,
  );
  for (let i = 0; i < placed.length; i++) placed[i].id = ids[i];
  placed.sort((a, b) => a.id - b.id);
  return placed;
}

/**
 * Generates the layout for one field. Same arguments always give the same items.
 * Throws only if 20 reseeded attempts all fail (the tests prove the presets never do).
 */
export function generateLayout(
  field: Field,
  whole: number,
  chipped: number,
  seed: number,
  sizeCm: number,
  gapCm: number,
): Item[] {
  const slots = planSlots(whole, chipped);
  for (let attempt = 0; attempt < RESEEDS; attempt++) {
    const r = rng((seed >>> 0) + attempt * 7919 + (field.space === "far" ? 104729 : 0));
    const items = tryPlace(field, slots, sizeCm, gapCm, r);
    if (items) return items;
  }
  throw new Error("layout failed: field too crowded for " + (whole + chipped) + " items");
}
