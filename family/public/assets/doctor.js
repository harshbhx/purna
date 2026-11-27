// /doctor#t=<share token>: read-only therapist view with every measure, CSV, print and notes.
import { api, takeFragment } from "./api.js";
import { replay, trendChart } from "./charts.js";
import { kvList, measures, therapistRows } from "./session-view.js";
import { toCsv } from "./csv.js";
import { $, el, fix, fmtDate, message, show } from "./ui.js";

const TOKEN_KEY = "purna.doctorToken";
let token = takeFragment("t");
try {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else token = sessionStorage.getItem(TOKEN_KEY);
} catch { /* private mode: the token only lives in memory */ }

const COLS = [
  ["Date", (s) => new Date(s.startedAt).toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }), (s) => s.startedAt],
  ["Level", (s) => s.settings.preset],
  ["Left", (s) => `${s.near.leftHits}/${s.near.leftTotal}`],
  ["Right", (s) => `${s.near.rightHits}/${s.near.rightTotal}`],
  ["CoC", (s) => fix(s.near.coc)],
  ["Ego asym", (s) => fix(s.near.egoAsym)],
  ["Allo asym", (s) => String(s.near.alloAsym)],
  ["Chip L/R", (s) => `${s.near.fpChipLeft}/${s.near.fpChipRight}`],
  ["Best r", (s) => fix(s.near.bestR)],
  ["Crossings", (s) => String(s.near.crossings)],
  ["Revisits", (s) => String(s.near.revisits)],
  ["Hints", (s) => String(s.cues.hint1 + s.cues.hint2)],
  ["Max left°", (s) => s.head.maxLeftDeg.toFixed(0)],
  ["Time left", (s) => Math.round(s.head.pctTimeLeft * 100) + "%"],
  ["Ended", (s) => s.near.endedBy],
];

function render(d) {
  show($("#view"), true);
  $("#out").replaceChildren();
  show($("#csv"), d.sessions.length > 0);
  show($("#print"), true);
  $("#title").textContent = `${d.patient.name}: Purna practice`;
  $("#expires").textContent = `This link works until ${fmtDate(d.expiresAt, { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" })}.`;

  const table = $("#table");
  table.replaceChildren(
    el("caption", { class: "sr-only", text: "Every session, newest first" }),
    el("thead", {}, el("tr", {}, COLS.map(([h]) => el("th", { scope: "col", text: h })))),
    el("tbody", {}, d.sessions.map((s) => el("tr", {}, COLS.map(([, f]) => el("td", { text: f(s) }))))),
  );
  if (!d.sessions.length) table.replaceChildren(el("caption", { text: "No sessions yet." }));

  const pts = d.sessions.slice().reverse().map((s) => ({
    date: s.startedAt,
    left: s.near.leftTotal ? s.near.leftHits / s.near.leftTotal : null,
    right: s.near.rightTotal ? s.near.rightHits / s.near.rightTotal : null,
  }));
  $("#trend").replaceChildren(pts.length ? trendChart(pts, $("#trend").clientWidth) : el("p", { class: "muted", text: "No sessions yet." }));

  $("#replays").replaceChildren(...d.sessions.slice(0, 20).map((s, i) => {
    const det = el("details", { class: "card", open: i === 0 },
      el("summary", { text: `${new Date(s.startedAt).toLocaleString()} · ${s.summary}` }));
    let filled = false;
    const fill = () => {
      if (filled) return;
      filled = true;
      const dl = el("dl", { class: "kv" });
      kvList(dl, therapistRows(s));
      det.append(replay(s, { animate: false }), el("div", { class: "measures" }, measures(s)), el("p"), dl);
    };
    det.addEventListener("toggle", () => det.open && fill());
    if (i === 0) fill();
    return det;
  }));

  renderNotes(d.notes);
  $("#csv").onclick = () => {
    const blob = new Blob([toCsv(d.sessions)], { type: "text/csv;charset=utf-8" });
    const a = el("a", { href: URL.createObjectURL(blob), download: `purna-${d.patient.name.replace(/[^\w-]+/g, "_")}.csv` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  $("#print").onclick = () => {
    for (const det of document.querySelectorAll("#replays details")) det.open = true;
    window.print();
  };
}

function renderNotes(notes) {
  $("#notes").replaceChildren(...(notes.length
    ? notes.map((n) => el("div", { class: "note" }, el("span", { class: "when", text: fmtDate(n.createdAt, { day: "numeric", month: "long", year: "numeric" }) }), n.text))
    : [el("p", { class: "muted", text: "No notes yet." })]));
}

$("#note-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const out = $("#note-msg");
  const text = $("#note").value.trim();
  if (!text) return message(out, "Write a note first.");
  try {
    await api("/doctor/notes", { method: "POST", body: { text }, auth: token });
    $("#note").value = "";
    message(out, "Saved. The family will see it on their page.", "ok");
    const d = await api("/doctor", { auth: token });
    renderNotes(d.notes);
  } catch (err) {
    message(out, err.message);
  }
});

async function start() {
  if (!token) {
    $("#out").replaceChildren(el("p", { text: "This link is missing its key. Ask the family to copy it again." }));
    return;
  }
  try {
    render(await api("/doctor", { auth: token }));
  } catch (err) {
    $("#out").replaceChildren(el("div", { class: "msg err", role: "alert", text: err.message }));
  }
}
start();
