// The search path on the table, seen from above: lit diyas numbered in order and joined by a thread,
// missed whole diyas dashed, chipped diyas as open rings with their gap.
import { m } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { SessionJson } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

const W = 70, D = 45;
const SIZE_CM: Record<string, number> = { easy: 6, standard: 6, hard: 5 };

export function chippedPath(cx: number, cy: number, r: number, side: "L" | "R" | null) {
  const gap = (35 * Math.PI) / 180;
  const mid = side === "L" ? Math.PI : 0;
  const a0 = mid + gap, a1 = mid + 2 * Math.PI - gap;
  const p = (a: number) => `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  return `M ${p(a0)} A ${r} ${r} 0 1 1 ${p(a1)}`;
}

export function Replay({ session, animate = true, replayKey = 0, attention = true, className }: { session: SessionJson; animate?: boolean; replayKey?: number; attention?: boolean; className?: string }) {
  const reduce = useReducedMotion();
  const near = session.near;
  const r = (SIZE_CM[session.settings?.preset] ?? 6) / 2;
  const byId = new Map(near.items.map((it) => [it.id, it]));
  const order = near.events.filter((e) => e.r === "lit" && byId.has(e.id)).map((e) => byId.get(e.id)!);
  const chippedLit = new Set(near.events.filter((e) => e.r === "chipped").map((e) => e.id));
  const lit = new Set(order.map((it) => it.id));
  const draw = animate && !reduce;
  const tr = useT();
  const missedL = near.leftTotal - near.leftHits, missedR = near.rightTotal - near.rightHits;
  const attn = attention ? session.head?.attention : undefined;
  const attnMax = attn && attn.length ? Math.max(...attn) : 0;
  const attnLeft = attn ? Math.round(attn.slice(0, Math.floor(attn.length / 2)).reduce((a, b) => a + b, 0) * 100) : 0;
  return (
    <svg
      viewBox={`${-W / 2 - 2} ${-D / 2 - 2} ${W + 4} ${D + 12}`}
      role="img"
      className={cn("block h-auto w-full", className)}
      aria-label={tr.replayAria(order.length, missedL, missedR, near.fpChipLeft, near.fpChipRight) + (attnMax > 0 ? tr.attentionAria(attnLeft) : "")}
    >
      <rect x={-W / 2} y={-D / 2} width={W} height={D} rx="2" className="fill-surface stroke-border" strokeWidth=".5" />
      {/* Where the head pointed during the table task: brighter = longer. The half never looked at stays dark. */}
      {attnMax > 0 && (
        <g className="attention" aria-hidden="true">
          {attn!.map((v, i) => (
            <rect key={i} x={-W / 2 + (i * W) / attn!.length} y={-D / 2} width={W / attn!.length + 0.05} height={D} fill="var(--flame)" opacity={(0.32 * v) / attnMax} />
          ))}
        </g>
      )}
      <line x1="0" x2="0" y1={-D / 2} y2={D / 2} className="stroke-muted-foreground/50" strokeWidth=".3" strokeDasharray="1 1" />
      {near.items.map((it) =>
        it.kind === "whole" ? (
          lit.has(it.id) ? null : <circle key={it.id} cx={it.x} cy={it.u} r={r * 0.95} className="diya-dark" />
        ) : (
          <path key={it.id} d={chippedPath(it.x, it.u, r * 0.85, it.chip)} className={chippedLit.has(it.id) ? "diya-chip-lit" : "diya-chip"} />
        ),
      )}
      {order.length > 1 && (
        <m.polyline
          key={replayKey}
          points={order.map((it) => `${it.x},${it.u}`).join(" ")}
          className="thread"
          initial={draw ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: Math.min(4, 0.4 * order.length), ease: "easeInOut" }}
        />
      )}
      {/* Lit diyas sit on top of the thread so their numbers stay readable. */}
      {order.map((it) => (
        <circle key={`lit-${it.id}`} cx={it.x} cy={it.u} r={r * 0.95} className="diya-lit" />
      ))}
      {order.map((it, i) => (
        <text key={it.id} x={it.x} y={it.u + 0.95} textAnchor="middle" className="order">{i + 1}</text>
      ))}
      <text x={-W / 2 + 1} y={D / 2 + 5} className="rp-text">{tr.replayLeft}</text>
      <text x={W / 2 - 1} y={D / 2 + 5} textAnchor="end" className="rp-text">{tr.replayRight}</text>
      <text x="0" y={D / 2 + 8.5} textAnchor="middle" className="rp-text">{tr.replaySeat}</text>
    </svg>
  );
}
