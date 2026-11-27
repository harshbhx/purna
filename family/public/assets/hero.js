// The landing page's one moment: a night table where the right half lights first, the left stays
// dark, a bell rings from the left, the beam sweeps, and then the left half lights too.
// Geometry follows Core's NEAR_FIELD (70 x 45 cm, x right-positive, u negative = far side).

const NS = "http://www.w3.org/2000/svg";
const W = 70;
const D = 45;

const CAPTIONS = {
  start: "Diyas on a dining table, seen through the glasses.",
  right: "The right side lights first. The left side stays dark.",
  hint: "Stuck for six seconds: a bell rings from the left and the beam sweeps that way.",
  whole: "The head turns, and the table is whole.",
};

function s(tag, attrs = {}, text) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  if (text !== undefined) n.textContent = text;
  return n;
}

/** A diya from slightly above: clay bowl with a small spout, flame on top. Chipped ones get a gap. */
function lamp(it) {
  const g = s("g", { class: "nt-lamp" + (it.kind === "chipped" ? " nt-chip" : ""), transform: `translate(${it.x} ${it.u})`, "data-id": it.id });
  if (it.kind === "whole") {
    g.append(s("circle", { class: "nt-glow", cx: 0, cy: -0.6, r: 7 }));
    g.append(s("path", { class: "nt-bowl", d: "M-3.1,-0.2 Q-2.6,2.3 0,2.4 Q2.6,2.3 3.1,-0.2 L4.2,-0.9 L2.6,-0.9 Q0,-1.6 -2.6,-0.9 Z" }));
    g.append(s("path", { class: "nt-flame", d: "M0,-5.6 C1.3,-3.6 1.4,-2 0,-1.1 C-1.4,-2 -1.3,-3.6 0,-5.6 Z" }));
  } else {
    // An open bowl with a notch facing the chip side.
    const notch = it.chip === "L" ? -1 : 1;
    const d = notch < 0
      ? "M-1.8,-0.9 Q0,-1.5 2.6,-0.9 L3.1,-0.2 Q2.6,2.3 0,2.4 Q-2.6,2.3 -3.1,-0.2"
      : "M1.8,-0.9 Q0,-1.5 -2.6,-0.9 L-3.1,-0.2 Q-2.6,2.3 0,2.4 Q2.6,2.3 3.1,-0.2";
    g.append(s("path", { class: "nt-bowl", d }));
  }
  return g;
}

/** Sweep order a healthy reader uses on the right: rows far to near, left to right within a row. */
function rightOrder(items) {
  return items.slice().sort((a, b) => {
    const ra = Math.floor((a.u + 30) / 10);
    const rb = Math.floor((b.u + 30) / 10);
    return ra !== rb ? ra - rb : a.x - b.x;
  });
}

/**
 * Builds the night table from a session's table layout.
 * Returns { svg, play(onCaption), showFinal(onCaption) }. play() returns a cancel function.
 */
export function nightTable(session) {
  const items = session.near.items;
  const svg = s("svg", { viewBox: `${-W / 2 - 3} ${-D / 2 - 6} ${W + 6} ${D + 12}`, role: "img",
    "aria-label": "A dining table seen through the glasses with 12 whole and 12 chipped clay diyas. The whole diyas on the right light one by one while the left side stays dark; a bell rings from the left, a beam sweeps left, and then the left diyas light too." });
  const defs = s("defs");
  const glow = s("radialGradient", { id: "nt-glow" });
  glow.append(s("stop", { offset: "0", "stop-color": "#ffb23f", "stop-opacity": ".55" }), s("stop", { offset: "1", "stop-color": "#ffb23f", "stop-opacity": "0" }));
  const beam = s("linearGradient", { id: "nt-beam", x1: "0", x2: "1", y1: "0", y2: "0" });
  beam.append(s("stop", { offset: "0", "stop-color": "#ffe2a3", "stop-opacity": ".9" }), s("stop", { offset: "1", "stop-color": "#ffe2a3", "stop-opacity": "0" }));
  defs.append(glow, beam);
  svg.append(defs);
  svg.append(s("rect", { class: "nt-top", x: -W / 2, y: -D / 2, width: W, height: D, rx: 2.5 }));
  svg.append(s("line", { class: "nt-mid", x1: 0, x2: 0, y1: -D / 2 + 1, y2: D / 2 - 1 }));
  const beamRect = s("rect", { class: "nt-beam", x: -W / 2, y: -D / 2, width: 16, height: D, rx: 2.5 });
  svg.append(beamRect);
  const rings = [0, 1, 2].map(() => s("circle", { class: "nt-ring", cx: -W / 2 + 1, cy: 0, r: 16 }));
  svg.append(...rings);
  const lamps = new Map();
  for (const it of items) {
    const g = lamp(it);
    lamps.set(it.id, g);
    svg.append(g);
  }
  svg.append(s("text", { class: "nt-label", x: -W / 2, y: D / 2 + 4.5 }, "Left"));
  svg.append(s("text", { class: "nt-label", x: W / 2, y: D / 2 + 4.5, "text-anchor": "end" }, "Right"));

  const wholes = items.filter((i) => i.kind === "whole");
  const right = rightOrder(wholes.filter((i) => i.x > 0));
  const left = wholes.filter((i) => i.x < 0).sort((a, b) => b.x - a.x); // centre outward, as the head turns

  const light = (it) => lamps.get(it.id).classList.add("lit");
  const reset = () => {
    for (const g of lamps.values()) g.classList.remove("lit");
    beamRect.classList.remove("on");
    for (const r of rings) r.classList.remove("ring");
  };

  /** @param {(text: string, done: boolean) => void} [onCaption] */
  function showFinal(onCaption = () => {}) {
    reset();
    wholes.forEach(light);
    onCaption(CAPTIONS.whole, true);
  }

  /** @param {(text: string, done: boolean) => void} [onCaption] @returns {() => void} cancel */
  function play(onCaption = () => {}) {
    reset();
    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    let t = 500;
    onCaption(CAPTIONS.start, false);
    at(t, () => onCaption(CAPTIONS.right, false));
    for (const it of right) at((t += 420), () => light(it));
    t += 1400;
    at(t, () => {
      onCaption(CAPTIONS.hint, false);
      rings.forEach((r, i) => setTimeout(() => r.classList.add("ring"), i * 350));
    });
    at((t += 900), () => beamRect.classList.add("on"));
    at((t += 1300), () => beamRect.classList.remove("on"));
    for (const it of left) at((t += 380), () => light(it));
    at((t += 500), () => onCaption(CAPTIONS.whole, true));
    return () => timers.forEach(clearTimeout);
  }

  return { svg, play, showFinal, order: { right: right.map((i) => i.id), left: left.map((i) => i.id) } };
}

export { CAPTIONS };
