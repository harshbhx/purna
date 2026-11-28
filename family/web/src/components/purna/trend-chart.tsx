// Left and right found, per session, oldest to newest. Drawn at its container's real pixel width so labels
// stay readable on a phone. Lines are labelled in text, and the left line is solid, so colour isn't the only cue.
import { useEffect, useRef, useState } from "react";
import { useLang, useT } from "@/lib/i18n";

export interface TrendPoint { date: string; left: number | null; right: number | null }

const pctText = (v: number | null | undefined) => (v === null || v === undefined ? "none" : Math.round(v * 100) + "%");

/** Optional: the person's usual session-to-session change, drawn as a soft band around the left line (lib/session dayToDay). */
export interface TrendBand { spread: number; centre: (number | null)[] }

export function TrendChart({ points, height, band }: { points: TrendPoint[]; height?: number; band?: TrendBand | null }) {
  const lang = useLang();
  const tr = useT();
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth || 640);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const W = Math.max(280, Math.min(1000, Math.round(width)));
  const H = height ?? (W < 480 ? 200 : 240);
  const L = 40, R = 84, T = 14, B = 30;
  const n = points.length;
  const x = (i: number) => (n === 1 ? L + (W - L - R) / 2 : L + (i * (W - L - R)) / (n - 1));
  const y = (v: number) => T + (1 - v) * (H - T - B);
  const step = Math.max(1, Math.ceil(n / Math.max(3, Math.floor((W - L - R) / 70))));
  const series = [
    { key: "right" as const, name: tr.right, cls: "stroke-side-r", fill: "fill-side-r", dash: "6 5" },
    { key: "left" as const, name: tr.left, cls: "stroke-side-l", fill: "fill-side-l", dash: undefined },
  ];
  const last = points[n - 1], first = points[0];
  const close = last && last.left !== null && last.right !== null && Math.abs(last.left - last.right) < 0.08;
  return (
    <div ref={ref} className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" className="block h-auto w-full"
        aria-label={!n ? (lang === "hi" ? "अभी कोई सत्र नहीं" : "No sessions yet") : lang === "hi"
          ? `${n} सत्रों का रुझान: बाईं ओर मिले दीये ${pctText(first.left)} से ${pctText(last.left)} हुए; दाईं ओर ${pctText(first.right)} से ${pctText(last.right)}।`
          : `Trend over ${n} session${n === 1 ? "" : "s"}: left found went from ${pctText(first.left)} to ${pctText(last.left)}; right found went from ${pctText(first.right)} to ${pctText(last.right)}.`}>
        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="stroke-border" />
            <text x={L - 8} y={y(v) + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">{Math.round(v * 100)}%</text>
          </g>
        ))}
        {points.map((p, i) => (i % step === 0 || i === n - 1) && (
          <text key={p.date + i} x={x(i)} y={H - 8} textAnchor="middle" className="fill-muted-foreground text-[11px]">
            {new Date(p.date).toLocaleDateString(lang === "hi" ? "hi-IN" : undefined, { day: "numeric", month: "short" })}
          </text>
        ))}
        {band && (() => {
          const pts = band.centre.map((c, i) => [x(i), c] as const).filter(([, c]) => c !== null) as [number, number][];
          if (pts.length < 2) return null;
          const clamp = (v: number) => Math.max(0, Math.min(1, v));
          const top = pts.map(([px, c]) => `${px},${y(clamp(c + band.spread))}`);
          const bottom = pts.slice().reverse().map(([px, c]) => `${px},${y(clamp(c - band.spread))}`);
          return <polygon data-band points={[...top, ...bottom].join(" ")} className="fill-side-l/12" />;
        })()}
        {series.map((s) => {
          const pts = points.map((p, i) => [x(i), p[s.key]] as const).filter(([, v]) => v !== null) as [number, number][];
          if (!pts.length) return null;
          const [lx, lv] = pts[pts.length - 1];
          const off = close ? (s.key === "left" ? 8 : -8) : 0;
          return (
            <g key={s.key}>
              {pts.length > 1 && <polyline points={pts.map(([px, v]) => `${px},${y(v)}`).join(" ")} fill="none" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={s.dash} className={s.cls} />}
              {pts.map(([px, v], i) => <circle key={i} cx={px} cy={y(v)} r="4" className={`${s.fill} stroke-card`} strokeWidth="2" />)}
              <text x={lx + 10} y={y(lv) + 4 + off} className={`${s.fill} text-[12px] font-semibold chart-label`}>{`${s.name} ${Math.round(lv * 100)}%`}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
