// The landing's one orchestrated moment: on a night table, the right half lights first, the left stays
// dark, a bell ripples from the left and the beam sweeps, then the left lights from the centre outward.
// Geometry follows Core's NEAR_FIELD (70 x 45 cm, x right-positive, u negative = far side).
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ItemJson, SessionJson } from "@/lib/types";
import { cn } from "@/lib/utils";

export const CAPTIONS = {
  start: "Diyas on a dining table, seen through the glasses.",
  right: "The right side lights first. The left side stays dark.",
  hint: "Stuck for six seconds: a bell rings from the left and the beam sweeps that way.",
  whole: "The head turns, and the table is whole.",
};

const W = 70;
const D = 45;

/** Reading order on the right (rows far to near, left to right) and centre-outward on the left. */
export function lightingOrder(items: ItemJson[]) {
  const wholes = items.filter((i) => i.kind === "whole");
  const right = wholes.filter((i) => i.x > 0).sort((a, b) => {
    const ra = Math.floor((a.u + 30) / 10), rb = Math.floor((b.u + 30) / 10);
    return ra !== rb ? ra - rb : a.x - b.x;
  });
  const left = wholes.filter((i) => i.x < 0).sort((a, b) => b.x - a.x);
  return { right, left, wholes };
}

function Lamp({ it, lit }: { it: ItemJson; lit: boolean }) {
  if (it.kind === "whole") {
    return (
      <g className={cn("nt-lamp", lit && "lit")} transform={`translate(${it.x} ${it.u})`} data-id={it.id}>
        <circle className="nt-glow" cx="0" cy="-0.6" r="7" />
        <path className="nt-bowl" d="M-3.1,-0.2 Q-2.6,2.3 0,2.4 Q2.6,2.3 3.1,-0.2 L4.2,-0.9 L2.6,-0.9 Q0,-1.6 -2.6,-0.9 Z" />
        <path className="nt-flame" d="M0,-5.6 C1.3,-3.6 1.4,-2 0,-1.1 C-1.4,-2 -1.3,-3.6 0,-5.6 Z" />
      </g>
    );
  }
  const d = it.chip === "L"
    ? "M-1.8,-0.9 Q0,-1.5 2.6,-0.9 L3.1,-0.2 Q2.6,2.3 0,2.4 Q-2.6,2.3 -3.1,-0.2"
    : "M1.8,-0.9 Q0,-1.5 -2.6,-0.9 L-3.1,-0.2 Q-2.6,2.3 0,2.4 Q2.6,2.3 3.1,-0.2";
  return (
    <g className="nt-lamp nt-chip" transform={`translate(${it.x} ${it.u})`} data-id={it.id}>
      <path className="nt-bowl" d={d} />
    </g>
  );
}

export function NightTable({ session, className }: { session: SessionJson; className?: string }) {
  const reduce = useReducedMotion();
  const items = session.near.items;
  const order = useMemo(() => lightingOrder(items), [items]);
  const [lit, setLit] = useState<Set<number>>(new Set());
  const [beam, setBeam] = useState(false);
  const [ring, setRing] = useState(0);
  const [caption, setCaption] = useState(CAPTIONS.start);
  const [done, setDone] = useState(false);
  const timers = useRef<number[]>([]);

  const stop = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const showFinal = useCallback(() => {
    stop();
    setLit(new Set(order.wholes.map((i) => i.id)));
    setBeam(false);
    setCaption(CAPTIONS.whole);
    setDone(true);
  }, [order]);

  const play = useCallback(() => {
    stop();
    setLit(new Set()); setBeam(false); setDone(false); setCaption(CAPTIONS.start);
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    const light = (id: number) => setLit((s) => new Set(s).add(id));
    let t = 500;
    at(t, () => setCaption(CAPTIONS.right));
    for (const it of order.right) at((t += 420), () => light(it.id));
    t += 1400;
    at(t, () => { setCaption(CAPTIONS.hint); setRing((r) => r + 1); });
    at((t += 900), () => setBeam(true));
    at((t += 1300), () => setBeam(false));
    for (const it of order.left) at((t += 380), () => light(it.id));
    at((t += 500), () => { setCaption(CAPTIONS.whole); setDone(true); });
  }, [order]);

  useEffect(() => {
    if (reduce) showFinal();
    else play();
    return stop;
  }, [reduce, play, showFinal]);

  return (
    <figure className={cn("m-0", className)}>
      <div id="hero-table">
        <svg viewBox={`${-W / 2 - 3} ${-D / 2 - 3} ${W + 6} ${D + 6}`} role="img" className="block h-auto w-full"
          aria-label="A dining table seen through the glasses with whole and chipped clay diyas. The whole diyas on the right light one by one while the left side stays dark; a bell rings from the left, a beam sweeps left, and then the left diyas light too.">
          <defs>
            <radialGradient id="nt-glow"><stop offset="0" stopColor="#ffb23f" stopOpacity=".55" /><stop offset="1" stopColor="#ffb23f" stopOpacity="0" /></radialGradient>
            <linearGradient id="nt-beam" x1="0" x2="1"><stop offset="0" stopColor="#ffe2a3" stopOpacity=".9" /><stop offset="1" stopColor="#ffe2a3" stopOpacity="0" /></linearGradient>
          </defs>
          <rect className="nt-top" x={-W / 2} y={-D / 2} width={W} height={D} rx="2.5" />
          <line className="nt-mid" x1="0" x2="0" y1={-D / 2 + 1} y2={D / 2 - 1} />
          <rect className={cn("nt-beam", beam && "on")} x={-W / 2} y={-D / 2} width="16" height={D} rx="2.5" />
          {ring > 0 && [0, 1, 2].map((i) => <circle key={`${ring}-${i}`} className="nt-ring" style={{ animationDelay: `${i * 0.35}s` }} cx={-W / 2 + 1} cy="0" r="16" />)}
          {items.map((it) => <Lamp key={it.id} it={it} lit={lit.has(it.id)} />)}
        </svg>
      </div>
      <figcaption className="mt-3 flex min-h-[2.75rem] items-baseline justify-between gap-4 text-[15px] text-night-muted">
        <span id="hero-caption">{caption}</span>
        {done && !reduce && (
          <button type="button" onClick={play} className="shrink-0 font-medium text-night-foreground underline decoration-flame underline-offset-4 hover:opacity-80">
            Play again
          </button>
        )}
      </figcaption>
    </figure>
  );
}
