const DAY = 86400000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }): string {
  return new Date(iso).toLocaleDateString(undefined, opts);
}

export function fmtWhen(iso: string): string {
  const d = new Date(iso);
  const days = Math.floor((startOfDay(new Date()) - startOfDay(d)) / DAY);
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (days === 0) return "Today, " + time;
  if (days === 1) return "Yesterday, " + time;
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }) + ", " + time;
}

export const daysSince = (iso: string) => (Date.now() - new Date(iso).getTime()) / DAY;
export const pct = (x: number | null | undefined) => (x === null || x === undefined ? "–" : Math.round(x * 100) + "%");
export const fix = (x: number | null | undefined, d = 2) => (x === null || x === undefined ? "–" : Number(x).toFixed(d).replace("-", "−"));
export const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
