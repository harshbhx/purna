// Draws docs/img/bench.svg from the patient bench: the real engine, three simulated search styles,
// 200 seeds each. Run: cd tools && npm run chart
// Colours: the dataviz reference palette, slots 1-3, validated light + dark (values are labelled
// on every bar because two hues sit under 3:1 contrast on white).

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { runPlayer, type Player } from "../test/bench";

const SEEDS = 200;
const players: { id: Player; name: string; light: string; dark: string }[] = [
  { id: "healthy", name: "Healthy", light: "#257de0", dark: "#338ced" },
  { id: "leftNeglect", name: "Left neglect", light: "#f47230", dark: "#e76624" },
  { id: "objectNeglect", name: "Object neglect", light: "#00b894", dark: "#00a888" },
];

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const stats = players.map((p) => {
  const runs = Array.from({ length: SEEDS }, (_, i) => runPlayer(p.id, i + 1));
  return {
    ...p,
    leftPct: mean(runs.map((r) => r.near.leftHits / r.near.leftTotal)) * 100,
    hints: mean(runs.map((r) => r.cues.hint1 + r.cues.hint2)),
    chipLeft: mean(runs.map((r) => r.near.fpChipLeft)),
    turn: mean(runs.map((r) => r.head.maxLeftDeg)),
  };
});

type Panel = { title: string; key: "leftPct" | "hints" | "chipLeft" | "turn"; max: number; fmt: (v: number) => string };
const panels: Panel[] = [
  { title: "Left diyas found", key: "leftPct", max: 100, fmt: (v) => Math.round(v) + "%" },
  { title: "Hints needed", key: "hints", max: 4, fmt: (v) => v.toFixed(1) },
  { title: "Chipped-on-left diyas lit", key: "chipLeft", max: 6, fmt: (v) => v.toFixed(1) },
  { title: "Head turned left (max °)", key: "turn", max: 40, fmt: (v) => Math.round(v) + "°" },
];

const W = 960, H = 400, PAD = 24, TOP = 136, BOTTOM = 56, GAP = 28;
const pw = (W - PAD * 2 - GAP * (panels.length - 1)) / panels.length;
const plotH = H - TOP - BOTTOM;
const barW = 36, barGap = 2 * 8;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

let body = "";
panels.forEach((pan, pi) => {
  const x0 = PAD + pi * (pw + GAP);
  const base = TOP + plotH;
  body += `<text class="h" x="${x0}" y="${TOP - 22}">${esc(pan.title)}</text>`;
  body += `<line class="axis" x1="${x0}" x2="${x0 + pw}" y1="${base}" y2="${base}"/>`;
  const groupW = players.length * barW + (players.length - 1) * barGap;
  const gx = x0 + (pw - groupW) / 2;
  stats.forEach((s, i) => {
    const v = s[pan.key];
    const h = Math.max(2, (Math.min(v, pan.max) / pan.max) * (plotH - 18));
    const x = gx + i * (barW + barGap);
    const y = base - h;
    // 4px rounded data end, square at the baseline.
    const r = Math.min(4, h / 2);
    body += `<path class="s${i}" d="M${x},${base} V${y + r} Q${x},${y} ${x + r},${y} H${x + barW - r} Q${x + barW},${y} ${x + barW},${y + r} V${base} Z"><title>${esc(s.name)}: ${pan.fmt(v)}</title></path>`;
    body += `<text class="v" x="${x + barW / 2}" y="${y - 6}" text-anchor="middle">${pan.fmt(v)}</text>`;
  });
});

const legend = players
  .map((p, i) => {
    const x = PAD + i * 170;
    return `<rect class="s${i}" x="${x}" y="68" width="12" height="12" rx="3"/><text class="l" x="${x + 18}" y="78">${esc(p.name)}</text>`;
  })
  .join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">Purna's report tells three search styles apart</title>
<desc id="d">Means over ${SEEDS} simulated sessions per player. ${stats
  .map((s) => `${s.name}: ${Math.round(s.leftPct)}% of left diyas found, ${s.hints.toFixed(1)} hints, ${s.chipLeft.toFixed(1)} chipped-on-left diyas lit, head turned up to ${Math.round(s.turn)}° left.`)
  .join(" ")}</desc>
<style>
  .bg { fill: #ffffff; } .t { fill: #1f1f1f; font: 600 20px system-ui, -apple-system, "Segoe UI", sans-serif; }
  .sub, .l { fill: #5c5c5c; font: 13px system-ui, -apple-system, "Segoe UI", sans-serif; }
  .h { fill: #1f1f1f; font: 600 14px system-ui, -apple-system, "Segoe UI", sans-serif; }
  .v { fill: #1f1f1f; font: 600 13px system-ui, -apple-system, "Segoe UI", sans-serif; font-variant-numeric: tabular-nums; }
  .axis { stroke: #c8c8c8; stroke-width: 1; } .foot { fill: #767676; font: 12px system-ui, sans-serif; }
  ${players.map((p, i) => `.s${i} { fill: ${p.light}; }`).join(" ")}
  @media (prefers-color-scheme: dark) {
    .bg { fill: #191919; } .t, .h, .v { fill: #efefef; } .sub, .l { fill: #b3b3b3; } .foot { fill: #9c9c9c; } .axis { stroke: #3d3d3d; }
    ${players.map((p, i) => `.s${i} { fill: ${p.dark}; }`).join(" ")}
  }
</style>
<rect class="bg" width="${W}" height="${H}" rx="12"/>
<text class="t" x="${PAD}" y="36">Purna's report tells three search styles apart</text>
<text class="sub" x="${PAD}" y="56">Mean over ${SEEDS} sessions per player, Standard level. The real engine, driven by scripted players.</text>
${legend}
${body}
<text class="foot" x="${PAD}" y="${H - 18}">Simulated players, not patients. Regenerate: cd tools &amp;&amp; npm run chart</text>
</svg>
`;

const out = join(process.cwd(), "..", "docs", "img", "bench.svg");
writeFileSync(out, svg);
// The same chart on the site's Results page (/docs#results).
writeFileSync(join(process.cwd(), "..", "family", "web", "public", "img", "bench.svg"), svg);
for (const s of stats) console.log(s.name.padEnd(15), `left ${s.leftPct.toFixed(0)}%  hints ${s.hints.toFixed(2)}  chipL ${s.chipLeft.toFixed(2)}  turn ${s.turn.toFixed(1)}°`);
console.log("wrote", out);
