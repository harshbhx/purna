// Plain-words measures and therapist numbers for one purna.session.v1 (docs/01-PRD.md §8).
import { el, fix, pct } from "./ui.js";

export function measures(s) {
  const n = s.near;
  const order = n.bestR === null ? "Too few to tell" : `Orderly: ${fix(n.bestR)}`;
  return [
    ["Left vs right", `Left ${n.leftHits} / ${n.leftTotal} · Right ${n.rightHits} / ${n.rightTotal}`],
    ["Chipped diyas", `Gap on left: ${n.fpChipLeft} lit · Gap on right: ${n.fpChipRight} lit`],
    ["Search order", `${order} · Crossings: ${n.crossings} · Revisits: ${n.revisits}`],
    ["Head turn", `Turned up to ${Math.round(s.head.maxLeftDeg)}° left`],
  ].map(([k, v]) => el("div", { class: "measure" }, el("b", { text: k }), el("span", { text: v })));
}

const cols = (a) => a.map((t) => (t === null ? "–" : t.toFixed(1) + " s")).join(" / ");

export function therapistRows(s) {
  const n = s.near;
  const rows = [
    ["Started", new Date(s.startedAt).toLocaleString()],
    ["Duration", s.durationS.toFixed(0) + " s"],
    ["Difficulty", s.settings.preset],
    ["Hint after", s.settings.hintDelayS + " s"],
    ["Beam start / end", `${s.settings.beamStart} / ${s.cues.beamEnd}`],
    ["Hints (bell / beam sweep)", `${s.cues.hint1} / ${s.cues.hint2}`],
    ["Table ended by", n.endedBy],
    ["Left found", `${n.leftHits}/${n.leftTotal} (${pct(n.leftTotal ? n.leftHits / n.leftTotal : null)})`],
    ["Right found", `${n.rightHits}/${n.rightTotal} (${pct(n.rightTotal ? n.rightHits / n.rightTotal : null)})`],
    ["Centre of Cancellation", fix(n.coc)],
    ["Egocentric asymmetry", fix(n.egoAsym)],
    ["Allocentric asymmetry", String(n.alloAsym)],
    ["Best r (search order)", fix(n.bestR)],
    ["Path crossings", String(n.crossings)],
    ["Revisits", String(n.revisits)],
    ["Mean step", n.meanStepCm === null ? "–" : n.meanStepCm.toFixed(1) + " cm"],
    ["Time per find, L / C / R", cols(n.timeByColumnS)],
    ["Head: max left / right", `${s.head.maxLeftDeg.toFixed(0)}° / ${s.head.maxRightDeg.toFixed(0)}°`],
    ["Time turned left", pct(s.head.pctTimeLeft)],
  ];
  if (s.far) rows.push(["Far board found", `L ${s.far.leftHits}/${s.far.leftTotal} · R ${s.far.rightHits}/${s.far.rightTotal} · CoC ${fix(s.far.coc)}`]);
  if (s.drift) rows.push(["Warm-up flickers", `${s.drift.hits} caught of ${s.drift.flickers} (${s.drift.misses} misses)`]);
  rows.push(["Lens version", s.lensVersion], ["Session id", s.sessionId]);
  return rows;
}

export function kvList(dl, rows) {
  dl.replaceChildren(...rows.flatMap(([k, v]) => [el("dt", { text: k }), el("dd", { text: v })]));
}
