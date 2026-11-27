// DOM helpers. All user-provided text goes in with textContent, never innerHTML.

export function el(tag, attrs = {}, ...children) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? "" : String(v));
  }
  for (const c of children.flat()) if (c !== null && c !== undefined && c !== false) n.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return n;
}

export const $ = (sel, root = document) => root.querySelector(sel);

export function show(node, on = true) { node.hidden = !on; }

export function message(target, text, kind = "err") {
  target.replaceChildren();
  if (!text) return;
  target.append(el("div", { class: "msg " + kind, role: kind === "err" ? "alert" : "status", text }));
}

const DAY = 86400000;
export function fmtDate(iso, opts = { day: "numeric", month: "short" }) {
  return new Date(iso).toLocaleDateString(undefined, opts);
}
export function fmtWhen(iso) {
  const d = new Date(iso);
  const days = Math.floor((startOfDay(new Date()) - startOfDay(d)) / DAY);
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (days === 0) return "Today, " + time;
  if (days === 1) return "Yesterday, " + time;
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }) + ", " + time;
}
function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); }

export function daysSince(iso) { return (Date.now() - new Date(iso).getTime()) / DAY; }

export async function copy(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    const old = button.textContent;
    button.textContent = "Copied ✓";
    setTimeout(() => { button.textContent = old; }, 1600);
  } catch {
    window.prompt("Copy this:", text);
  }
}

export function pct(x) { return x === null || x === undefined ? "–" : Math.round(x * 100) + "%"; }
export function fix(x, d = 2) { return x === null || x === undefined ? "–" : Number(x).toFixed(d); }
