// The search path on the table, seen from above: lit diyas numbered in order and joined by a thread,
// missed whole diyas dashed, chipped diyas as open rings with their gap.
import { motion } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { SessionJson } from "@/lib/types";
import { cn } from "@/lib/utils";

const W = 70, D = 45;
const SIZE_CM: Record<string, number> = { easy: 6, standard: 6, hard: 5 };

export function chippedPath(cx: number, cy: number, r: number, side: "L" | "R" | null) {
  const gap = (35 * Math.PI) / 180;
  const mid = side === "L" ? Math.PI : 0;
  const a0 = mid + gap, a1 = mid + 2 * Math.PI - gap;
  const p = (a: number) => `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  return `M ${p(a0)} A ${r} ${r} 0 1 1 ${p(a1)}`;
}

export function Replay({ session, animate = true, replayKey = 0, className }: { session: SessionJson; animate?: boolean; replayKey?: number; className?: string }) {
  const reduce = useReducedMotion();
  const near = session.near;
  const r = (SIZE_CM[session.settings?.preset] ?? 6) / 2;
  const byId = new Map(near.items.map((it) => [it.id, it]));
  const order = near.events.filter((e) => e.r === "lit" && byId.has(e.id)).map((e) => byId.get(e.id)!);
  const chippedLit = new Set(near.events.filter((e) => e.r === "chipped").map((e) => e.id));
  const lit = new Set(order.map((it) => it.id));
  const draw = animate && !reduce;
  const missedL = near.leftTotal - near.leftHits, missedR = near.rightTotal - near.rightHits;
  return (
    <svg
      viewBox={`${-W / 2 - 2} ${-D / 2 - 2} ${W + 4} ${D + 12}`}
      role="img"
      className={cn("block h-auto w-full", className)}
      aria-label={`Table seen from above. ${order.length} diyas lit, numbered in the order found. Missed: ${missedL} on the left, ${missedR} on the right. Chipped diyas lit by mistake: ${near.fpChipLeft} with the gap on the left, ${near.fpChipRight} with the gap on the right.`}
    >
      <rect x={-W / 2} y={-D / 2} width={W} height={D} rx="2" className="fill-surface stroke-border" strokeWidth=".5" />
      <line x1="0" x2="0" y1={-D / 2} y2={D / 2} className="stroke-muted-foreground/50" strokeWidth=".3" strokeDasharray="1 1" />
      {near.items.map((it) =>
        it.kind === "whole" ? (
          lit.has(it.id) ? null : <circle key={it.id} cx={it.x} cy={it.u} r={r * 0.95} className="diya-dark" />
        ) : (
          <path key={it.id} d={chippedPath(it.x, it.u, r * 0.85, it.chip)} className={chippedLit.has(it.id) ? "diya-chip-lit" : "diya-chip"} />
        ),
      )}
      {order.length > 1 && (
        <motion.polyline
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
      <text x={-W / 2 + 1} y={D / 2 + 5} className="rp-text">← Left</text>
      <text x={W / 2 - 1} y={D / 2 + 5} textAnchor="end" className="rp-text">Right →</text>
      <text x="0" y={D / 2 + 8.5} textAnchor="middle" className="rp-text">they sit here</text>
    </svg>
  );
}
