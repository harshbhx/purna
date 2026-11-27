// Hand-drawn SVG charts (docs/03-ARCHITECTURE.md §6.5): trend, mini bars, and the table replay.
// Geometry matches Core's NEAR_FIELD: 70 × 45 cm table, x right-positive, u negative = far from the patient.

const NS = "http://www.w3.org/2000/svg";
const TABLE_W = 70;
const TABLE_D = 45;
const SIZE_CM = { easy: 6, standard: 6, hard: 5 };

function s(tag, attrs = {}, text) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) n.setAttribute(k, String(v));
  if (text !== undefined) n.textContent = text;
  return n;
}

/** Two bars: left found / right found. Text carries the numbers so colour isn't the only signal. */
export function miniBars(c) {
  const wrap = document.createElement("div");
  wrap.className = "bars";
  const row = (label, hits, total, cls) => {
    const p = total > 0 ? hits / total : 0;
    const name = document.createElement("span");
    name.textContent = label;
    const bar = document.createElement("div");
    bar.className = "bar " + cls;
    bar.setAttribute("role", "img");
    bar.setAttribute("aria-label", `${label}: ${hits} of ${total} found`);
    const fill = document.createElement("i");
    fill.style.width = Math.round(p * 100) + "%";
    bar.append(fill);
    const val = document.createElement("span");
    val.className = "num";
    val.textContent = `${hits}/${total}`;
    wrap.append(name, bar, val);
  };
  row("Left", c.leftHits, c.leftTotal, "l");
  row("Right", c.rightHits, c.rightTotal, "r");
  return wrap;
}

/**
 * Trend of left % and right % found over sessions (oldest → newest).
 * points: [{ date: ISO, left: 0..1|null, right: 0..1|null }]
 */
export function trendChart(points, width = 640) {
  // Drawn at the container's real pixel width so labels stay readable on a phone.
  const W = Math.max(300, Math.min(900, Math.round(width))), H = W < 480 ? 210 : 240, L = 40, R = 96, T = 16, B = 34;
  const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "diagram", role: "img" });
  const n = points.length;
  const x = (i) => (n === 1 ? L + (W - L - R) / 2 : L + (i * (W - L - R)) / (n - 1));
  const y = (v) => T + (1 - v) * (H - T - B);
  for (const v of [0, 0.5, 1]) {
    svg.append(s("line", { x1: L, x2: W - R, y1: y(v), y2: y(v), class: "chart-grid" }));
    svg.append(s("text", { x: L - 8, y: y(v) + 4, "text-anchor": "end", class: "chart-text" }, Math.round(v * 100) + "%"));
  }
  const step = Math.max(1, Math.ceil(n / Math.max(3, Math.floor((W - L - R) / 70))));
  points.forEach((p, i) => {
    if (i % step === 0 || i === n - 1) {
      const d = new Date(p.date).toLocaleDateString(undefined, { day: "numeric", month: "short" });
      svg.append(s("text", { x: x(i), y: H - 10, "text-anchor": "middle", class: "chart-text" }, d));
    }
  });
  const series = [
    { key: "left", cls: "l", name: "Left", dash: null },
    { key: "right", cls: "r", name: "Right", dash: "6 4" },
  ];
  for (const ser of series) {
    const pts = points.map((p, i) => [x(i), p[ser.key]]).filter(([, v]) => v !== null && v !== undefined);
    if (pts.length === 0) continue;
    if (pts.length > 1) {
      svg.append(s("polyline", {
        points: pts.map(([px, v]) => `${px},${y(v)}`).join(" "),
        fill: "none", "stroke-width": 3, "stroke-linejoin": "round", "stroke-linecap": "round",
        "stroke-dasharray": ser.dash, class: "chart-line-" + ser.cls,
      }));
    }
    for (const [px, v] of pts) svg.append(s("circle", { cx: px, cy: y(v), r: 4, class: "fill-" + ser.cls }));
    const [lx, lv] = pts[pts.length - 1];
    const offset = ser.key === "left" ? 4 : -4;
    svg.append(s("text", { x: lx + 10, y: y(lv) + 4 + (pointsClose(points) ? offset * 2 : 0), class: "chart-label fill-" + ser.cls },
      `${ser.name} ${Math.round(lv * 100)}%`));
  }
  const last = points[n - 1];
  const first = points[0];
  svg.setAttribute("aria-label",
    `Trend over ${n} session${n === 1 ? "" : "s"}: left found went from ${pctText(first.left)} to ${pctText(last.left)}; ` +
    `right found went from ${pctText(first.right)} to ${pctText(last.right)}.`);
  return svg;
}

function pointsClose(points) {
  const p = points[points.length - 1];
  return p.left !== null && p.right !== null && Math.abs(p.left - p.right) < 0.08;
}
function pctText(v) { return v === null || v === undefined ? "none" : Math.round(v * 100) + "%"; }

function chippedPath(cx, cy, r, side) {
  // Ring with a 70° gap facing the chip side (L = 180°, R = 0°).
  const gap = (35 * Math.PI) / 180;
  const mid = side === "L" ? Math.PI : 0;
  const a0 = mid + gap;
  const a1 = mid + 2 * Math.PI - gap;
  const p = (a) => `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  return `M ${p(a0)} A ${r} ${r} 0 1 1 ${p(a1)}`;
}

/**
 * The search path on the table, seen from above. Lit diyas are numbered in the order found,
 * joined by the thread; missed whole diyas are dashed; chipped diyas show their gap.
 */
export function replay(session, { animate = true } = {}) {
  const near = session.near;
  const r = (SIZE_CM[session.settings && session.settings.preset] || 6) / 2;
  const svg = s("svg", { viewBox: `${-TABLE_W / 2 - 2} ${-TABLE_D / 2 - 2} ${TABLE_W + 4} ${TABLE_D + 12}`, class: "diagram", role: "img" });
  svg.append(s("rect", { x: -TABLE_W / 2, y: -TABLE_D / 2, width: TABLE_W, height: TABLE_D, rx: 2, class: "table-top" }));
  svg.append(s("line", { x1: 0, x2: 0, y1: -TABLE_D / 2, y2: TABLE_D / 2, class: "midline" }));
  svg.append(s("text", { x: -TABLE_W / 2 + 1.5, y: TABLE_D / 2 + 5, class: "rp-text" }, "← Left"));
  svg.append(s("text", { x: TABLE_W / 2 - 1.5, y: TABLE_D / 2 + 5, "text-anchor": "end", class: "rp-text" }, "Right →"));
  svg.append(s("text", { x: 0, y: TABLE_D / 2 + 8.5, "text-anchor": "middle", class: "rp-text" }, "they sit here"));

  const byId = new Map(near.items.map((it) => [it.id, it]));
  const litOrder = [];
  const chippedLit = new Set();
  for (const ev of near.events) {
    if (ev.r === "lit" && byId.has(ev.id)) litOrder.push(byId.get(ev.id));
    if (ev.r === "chipped") chippedLit.add(ev.id);
  }
  const lit = new Set(litOrder.map((it) => it.id));

  for (const it of near.items) {
    if (it.kind === "whole") {
      svg.append(s("circle", { cx: it.x, cy: it.u, r, class: lit.has(it.id) ? "diya-lit" : "diya-dark" }));
    } else {
      svg.append(s("path", { d: chippedPath(it.x, it.u, r * 0.9, it.chip), class: chippedLit.has(it.id) ? "diya-chip-lit" : "diya-chip" }));
    }
  }
  if (litOrder.length > 1) {
    const pl = s("polyline", { points: litOrder.map((it) => `${it.x},${it.u}`).join(" "), class: "thread" + (animate ? " animate" : "") });
    let len = 0;
    for (let i = 1; i < litOrder.length; i++) len += Math.hypot(litOrder[i].x - litOrder[i - 1].x, litOrder[i].u - litOrder[i - 1].u);
    pl.style.setProperty("--len", String(Math.ceil(len)));
    svg.append(pl);
  }
  litOrder.forEach((it, i) => {
    svg.append(s("text", { x: it.x, y: it.u + 0.95, "text-anchor": "middle", class: "order" }, String(i + 1)));
  });

  const missedLeft = near.leftTotal - near.leftHits;
  const missedRight = near.rightTotal - near.rightHits;
  svg.setAttribute("aria-label",
    `Table seen from above. ${litOrder.length} diyas lit, numbered in the order found. ` +
    `Missed: ${missedLeft} on the left, ${missedRight} on the right. ` +
    `Chipped diyas lit by mistake: ${near.fpChipLeft} with the gap on the left, ${near.fpChipRight} with the gap on the right.`);
  return svg;
}
