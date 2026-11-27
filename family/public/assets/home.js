// Home: landing + pairing, family dashboard, session detail (docs/02-DESIGN.md §9).
import { api, ApiError, clearKey, getKey, parseImport, setKey, takeFragment } from "./api.js";
import { miniBars, replay, trendChart } from "./charts.js";
import { kvList, measures, therapistRows } from "./session-view.js";
import { $, copy, daysSince, el, fmtDate, fmtWhen, message, show } from "./ui.js";

const state = { key: null, me: null, demo: null, sessions: new Map() };

// ---------- landing ----------

async function loadDemo() {
  if (state.demo) return state.demo;
  const r = await fetch("/demo/sessions.json");
  state.demo = await r.json();
  return state.demo;
}

async function heroReplay() {
  try {
    const demo = await loadDemo();
    const s = demo.find((x) => x.near.leftHits < x.near.leftTotal) || demo[0];
    $("#hero-replay").replaceChildren(replay(s));
  } catch { /* the hero still reads fine without it */ }
}

$("#pair").addEventListener("submit", async (e) => {
  e.preventDefault();
  const out = $("#pair-msg");
  const code = $("#code").value.trim();
  const name = $("#name").value.trim();
  if (!code) return message(out, "Type the code shown on the glasses, like DIYA-7K3P.");
  if (!name) return message(out, "Type what you call them, like Papa or Ramesh.");
  const btn = e.submitter || $("#pair button[type=submit]");
  btn.disabled = true;
  try {
    const r = await api("/pair", { method: "POST", body: { code, name } });
    setKey(r.familyKey);
    state.key = r.familyKey;
    message(out, "");
    await loadDashboard();
  } catch (err) {
    message(out, err.message);
  } finally {
    btn.disabled = false;
  }
});

$("#demo").addEventListener("click", async () => {
  const demo = await loadDemo();
  const sessions = demo.slice().sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  for (const s of sessions) state.sessions.set(s.sessionId, s);
  renderDashboard({
    patient: { name: "Papa" },
    sessions: sessions.map(toCard),
    notes: [{ id: "demo", text: "Good effort this week. Keep the hint delay at 6 s and try Hard on Friday.", createdAt: sessions[1].startedAt }],
    shares: [],
  }, true);
});

function toCard(s) {
  const n = s.near;
  return {
    id: s.sessionId, startedAt: s.startedAt, preset: s.settings.preset, summary: s.summary,
    leftHits: n.leftHits, leftTotal: n.leftTotal, rightHits: n.rightHits, rightTotal: n.rightTotal,
    leftPct: n.leftTotal ? n.leftHits / n.leftTotal : null, rightPct: n.rightTotal ? n.rightHits / n.rightTotal : null,
    coc: n.coc, hints: s.cues.hint1 + s.cues.hint2, maxLeftDeg: s.head.maxLeftDeg, endedBy: n.endedBy,
  };
}

// ---------- dashboard ----------

async function loadDashboard() {
  try {
    const me = await api("/me", { auth: state.key });
    renderDashboard(me, false);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      clearKey();
      state.key = null;
      showLanding();
      message($("#flash"), "This family link isn't valid any more. Ask your family for a new invite link, or pair again with a code from the glasses.");
    } else {
      message($("#flash"), err.message);
    }
  }
}

function showLanding() {
  show($("#landing"), true);
  show($("#dash"), false);
  show($("#signout"), false);
}

function sessionCard(c, big = false) {
  const btn = el("button", { type: "button", class: "session-card", "aria-label": `Open session from ${fmtWhen(c.startedAt)}` },
    el("span", { class: "when", text: `${fmtWhen(c.startedAt)} · ${c.preset}` }),
    el(big ? "p" : "div", { class: "line", text: c.summary }),
    miniBars(c));
  btn.addEventListener("click", () => openDetail(c.id));
  return btn;
}

function renderDashboard(me, demo) {
  state.me = me;
  const fromLanding = !$("#landing").hidden;
  show($("#landing"), false);
  show($("#dash"), true);
  show($("#signout"), !demo && !!state.key);
  show($("#demo-badge"), demo);
  show($("#tools"), !demo);
  message($("#flash"), demo ? "This is an example with simulated data. Pair with a code from the glasses to see a real practice." : "", "ok");
  $("#greeting").textContent = `${me.patient.name}'s practice`;
  $("#delete-label").textContent = `Type "${me.patient.name}" to confirm`;

  const nudge = $("#nudge");
  nudge.replaceChildren();
  const newest = me.sessions[0];
  if (!newest) {
    nudge.append(el("div", { class: "msg nudge", role: "status", text: "No practice yet. Start one on the glasses, then pinch Send to family." }));
  } else if (!demo && daysSince(newest.startedAt) > 3) {
    const day = new Date(newest.startedAt).toLocaleDateString(undefined, { weekday: "long" });
    nudge.append(el("div", { class: "msg nudge", role: "status", text: `No practice since ${day}. A few minutes today helps.` }));
  }

  $("#latest").replaceChildren(...(newest ? [el("h2", { class: "sr-only", text: "Latest session" }), sessionCard(newest, true)] : []));

  const pts = me.sessions.slice().reverse().map((c) => ({ date: c.startedAt, left: c.leftPct, right: c.rightPct }));
  if (pts.length > 0) {
    $("#trend").replaceChildren(trendChart(pts, $("#trend").clientWidth));
    $("#trend-cap").textContent = "Share of diyas found on each side, per session. The solid line is the left side.";
  } else {
    $("#trend").replaceChildren(el("p", { class: "muted", text: "The chart appears after the first session." }));
    $("#trend-cap").textContent = "";
  }

  const earlier = me.sessions.slice(1);
  $("#earlier").replaceChildren(...(earlier.length ? earlier.map((c) => sessionCard(c)) : [el("p", { class: "muted", text: "None yet." })]));

  $("#notes").replaceChildren(...(me.notes.length
    ? me.notes.map((n) => el("div", { class: "note" }, el("span", { class: "when", text: fmtDate(n.createdAt, { day: "numeric", month: "long", year: "numeric" }) }), n.text))
    : [el("p", { class: "muted", text: "When the therapist writes a note on the doctor link, it shows here." })]));

  if (!demo) {
    renderShares(me.shares);
    $("#invite-link").textContent = `${location.origin}/join#k=${state.key}`;
  }
  // Coming from the pairing form, start at the top of the dashboard, not where the form was.
  if (fromLanding) window.scrollTo(0, 0);
  const want = /^#s=([A-Za-z0-9_-]{4,64})$/.exec(location.hash);
  if (want) openDetail(want[1]);
}

// ---------- session detail ----------

async function openDetail(id) {
  const dlg = $("#detail");
  let s = state.sessions.get(id);
  if (!s) {
    try {
      s = (await api(`/me/sessions/${id}`, { auth: state.key })).session;
      state.sessions.set(id, s);
    } catch (err) {
      return message($("#flash"), err.message);
    }
  }
  $("#detail-title").textContent = fmtWhen(s.startedAt);
  $("#detail-summary").textContent = s.summary;
  $("#detail-replay").replaceChildren(replay(s));
  $("#detail-measures").replaceChildren(...measures(s));
  kvList($("#detail-kv"), therapistRows(s));
  $("#detail-again").onclick = () => $("#detail-replay").replaceChildren(replay(s));
  if (!dlg.open) dlg.showModal();
  history.replaceState(null, "", "#s=" + id);
}
$("#detail-close").addEventListener("click", () => $("#detail").close());
$("#detail").addEventListener("close", () => history.replaceState(null, "", location.pathname));

// ---------- tools ----------

for (const b of document.querySelectorAll("[data-panel]")) {
  b.addEventListener("click", () => {
    const panel = document.getElementById(b.dataset.panel);
    const open = panel.hidden;
    for (const p of ["share-panel", "invite-panel", "import-panel", "delete-panel"]) show(document.getElementById(p), false);
    show(panel, open);
    b.setAttribute("aria-expanded", String(open));
    if (open) panel.querySelector("button, textarea, input")?.focus();
  });
}

function renderShares(shares) {
  const list = $("#share-list");
  list.replaceChildren();
  if (!shares.length) return;
  list.append(el("p", { class: "muted small", text: "Active links:" }));
  for (const sh of shares) {
    const stop = el("button", { type: "button", class: "ghost small", text: "Stop sharing" });
    stop.addEventListener("click", async () => {
      stop.disabled = true;
      try {
        await api(`/me/shares/${sh.id}`, { method: "DELETE", auth: state.key });
        state.me.shares = state.me.shares.filter((x) => x.id !== sh.id);
        renderShares(state.me.shares);
        $("#share-new").replaceChildren();
        message($("#share-msg"), "Stopped. That link no longer works.", "ok");
      } catch (err) {
        stop.disabled = false;
        message($("#share-msg"), err.message);
      }
    });
    list.append(el("div", { class: "share" },
      el("span", { class: "small", text: `Made ${fmtDate(sh.createdAt)} · works until ${fmtDate(sh.expiresAt, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}` }), stop));
  }
}

$("#share-make").addEventListener("click", async (e) => {
  const btn = e.currentTarget;
  btn.disabled = true;
  try {
    const r = await api("/me/shares", { method: "POST", body: { days: 7 }, auth: state.key });
    const link = `${location.origin}/doctor#t=${r.token}`;
    const c = el("button", { type: "button", class: "ghost", text: "Copy link" });
    c.addEventListener("click", () => copy(link, c));
    $("#share-new").replaceChildren(
      el("p", { class: "small", text: "Send this to the therapist. You'll only see it once, so copy it now." }),
      el("div", { class: "linkbox", text: link }), el("p"), c);
    state.me.shares.unshift({ id: r.id, expiresAt: r.expiresAt, createdAt: new Date().toISOString() });
    renderShares(state.me.shares);
    message($("#share-msg"), "");
  } catch (err) {
    message($("#share-msg"), err.message);
  } finally {
    btn.disabled = false;
  }
});

$("#invite-copy").addEventListener("click", (e) => copy($("#invite-link").textContent, e.currentTarget));

$("#import-panel").addEventListener("submit", async (e) => {
  e.preventDefault();
  const out = $("#import-msg");
  const session = parseImport($("#import-text").value);
  if (!session) return message(out, "That doesn't look like a Purna session. Copy the whole line that starts with PURNA_SESSION.");
  try {
    const r = await api("/me/import", { method: "POST", body: { session }, auth: state.key });
    $("#import-text").value = "";
    message(out, r.duplicate ? "Already here. Nothing changed." : "Imported ✓", "ok");
    await loadDashboard();
  } catch (err) {
    message(out, err.message);
  }
});

$("#delete-panel").addEventListener("submit", async (e) => {
  e.preventDefault();
  const out = $("#delete-msg");
  try {
    await api("/me", { method: "DELETE", body: { confirm: $("#delete-confirm").value }, auth: state.key });
    clearKey();
    state.key = null;
    showLanding();
    message($("#flash"), "Everything is deleted. To start again, send a session from the glasses for a new code.", "ok");
  } catch (err) {
    message(out, err.message);
  }
});

$("#signout").addEventListener("click", () => {
  clearKey();
  state.key = null;
  showLanding();
  message($("#flash"), "Signed out on this device. Use your invite link to come back.", "ok");
});

// ---------- start ----------

const fromLink = takeFragment("k");
if (fromLink) setKey(fromLink);
state.key = getKey();
heroReplay();
if (state.key) loadDashboard();
