// /play: the diya table in a browser, on the same engine the Lens runs (Assets/Scripts/Core).
// The glasses only show about 37 cm of a 70 cm table at once, so here too only a window of the table
// shows its diyas; move the mouse (or drag, or press the arrow keys) to turn your head. Stall on the
// right with dark diyas on the left and the bell rings from your left speaker. Then the replay, the
// attention map and the report, as the family and the therapist would see them.
import { Bell, Eye, Play as PlayIcon, RotateCcw, Stethoscope, Volume2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AppHeader } from "@/components/purna/app-header";
import { Lamp } from "@/components/purna/night-table";
import { Replay } from "@/components/purna/replay";
import { SkipLink } from "@/components/purna/skip-link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { measures } from "@/lib/session";
import type { SessionJson } from "@/lib/types";
import { makeSessionId, PurnaEngine } from "../../../../Assets/Scripts/Core/PurnaEngine";
import type { Item, Preset } from "../../../../Assets/Scripts/Core/PurnaTypes";
import bellUrl from "../../../../Assets/Audio/bell.wav?url";
import lightUrl from "../../../../Assets/Audio/light.wav?url";
import tickUrl from "../../../../Assets/Audio/tick.wav?url";

const W = 70, D = 45;
/** Distance from the eyes to the table's centre line, cm (docs/02-DESIGN.md §2). */
const DIST = 65;
/** How much of the table the glasses show at once: 2 · 65 · tan(16°) ≈ 37 cm for SPECS' ~32° width. */
const VIEW = 37;
/** How far the head can turn here, as the centre of the view in cm. */
const REACH = 20;
const SIZE: Record<Preset, number> = { easy: 6, standard: 6, hard: 5 };
const BEAM_OPACITY = [0, 0.35, 0.6, 0.9];
export const PLAYED_KEY = "purna.played";

type Stage = "setup" | "task" | "done";

/** Head yaw for a view centred at x cm on the table (positive = turned left). */
export const yawFor = (cx: number) => (Math.atan2(-cx, DIST) * 180) / Math.PI + 0; // + 0 turns -0 into 0

function useSounds() {
  const ctx = useRef<AudioContext | null>(null);
  const buffers = useRef<Record<string, AudioBuffer>>({});
  const unlock = useCallback(async () => {
    if (ctx.current || typeof AudioContext === "undefined") return;
    const c = new AudioContext();
    ctx.current = c;
    await Promise.all(
      Object.entries({ bell: bellUrl, light: lightUrl, tick: tickUrl }).map(async ([k, url]) => {
        try { buffers.current[k] = await c.decodeAudioData(await (await fetch(url)).arrayBuffer()); } catch { /* no sound is fine */ }
      }),
    );
  }, []);
  /** pan: -1 = fully left speaker, +1 = fully right. */
  const play = useCallback((name: "bell" | "light" | "tick", pan: number) => {
    const c = ctx.current, b = buffers.current[name];
    if (!c || !b) return;
    const src = c.createBufferSource();
    src.buffer = b;
    const p = c.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, pan));
    src.connect(p).connect(c.destination);
    src.start();
  }, []);
  useEffect(() => () => { void ctx.current?.close(); }, []);
  return { unlock, play };
}

export function Play() {
  const [stage, setStage] = useState<Stage>("setup");
  const [preset, setPreset] = useState<Preset>("easy");
  const [neglect, setNeglect] = useState(false);
  const [cx, setCx] = useState(0);
  const [, setFrame] = useState(0);
  const [beam, setBeam] = useState(3);
  const [cue, setCue] = useState<"none" | "hint1" | "hint2">("none");
  const [caption, setCaption] = useState("");
  const [session, setSession] = useState<SessionJson | null>(null);
  const [replayKey, setReplayKey] = useState(0);
  const engine = useRef<PurnaEngine | null>(null);
  const t0 = useRef(0);
  const cxRef = useRef(0);
  const started = useRef("");
  const tableRef = useRef<HTMLDivElement>(null);
  const { unlock, play } = useSounds();
  const now = () => (performance.now() - t0.current) / 1000;

  const finishTask = useCallback(() => {
    const e = engine.current;
    if (!e) return;
    const s = e.report(started.current, makeSessionId(Date.now(), Math.random())) as SessionJson;
    setSession(s);
    setStage("done");
    try {
      const prev = JSON.parse(sessionStorage.getItem(PLAYED_KEY) || "[]") as SessionJson[];
      sessionStorage.setItem(PLAYED_KEY, JSON.stringify([s, ...prev].slice(0, 9)));
    } catch { /* private mode */ }
    requestAnimationFrame(() => document.getElementById("result-h")?.focus());
  }, []);

  async function start() {
    await unlock();
    const e = new PurnaEngine({ seed: Math.floor(Math.random() * 1e6), preset, hintDelayS: 6, drift: false, far: false });
    engine.current = e;
    t0.current = performance.now();
    started.current = new Date().toISOString();
    cxRef.current = 0;
    setCx(0);
    e.start(0);
    setSession(null);
    setStage("task");
    setCaption("");
    requestAnimationFrame(() => tableRef.current?.focus());
  }

  // The frame loop: feed the engine the time and head yaw, react to hints, end when the engine says so.
  useEffect(() => {
    if (stage !== "task") return;
    let raf = 0;
    let hintTimer = 0;
    const loop = () => {
      const e = engine.current!;
      const f = e.tick(now(), yawFor(cxRef.current));
      setBeam(f.beamLevel);
      if (f.cue === "hint1") {
        play("bell", -1);
        setCue("hint1");
        setCaption("A bell rings from your left.");
        window.clearTimeout(hintTimer);
        hintTimer = window.setTimeout(() => setCue("none"), 1400);
      } else if (f.cue === "hint2") {
        setCue("hint2");
        setCaption("The beam sweeps from the left.");
        window.clearTimeout(hintTimer);
        hintTimer = window.setTimeout(() => setCue("none"), 3000);
      }
      if (e.phase === "replay" || e.phase === "report") return finishTask();
      setFrame((n) => n + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.clearTimeout(hintTimer); };
  }, [stage, play, finishTask]);

  const turnTo = (x: number) => {
    const v = Math.max(-REACH, Math.min(REACH, x));
    cxRef.current = v;
    setCx(v);
  };

  function onPointer(ev: PointerEvent<HTMLDivElement>) {
    if (stage !== "task" || (ev.pointerType !== "mouse" && ev.buttons === 0)) return;
    const r = ev.currentTarget.getBoundingClientRect();
    turnTo(((ev.clientX - r.left) / r.width - 0.5) * 2 * REACH * 1.15);
  }

  function onKey(ev: KeyboardEvent<HTMLDivElement>) {
    if (stage !== "task") return;
    if (ev.key === "ArrowLeft" || ev.key === "a") { turnTo(cxRef.current - 4); ev.preventDefault(); }
    if (ev.key === "ArrowRight" || ev.key === "d") { turnTo(cxRef.current + 4); ev.preventDefault(); }
  }

  function pinch(it: Item) {
    const e = engine.current;
    if (!e || stage !== "task") return;
    const kind = e.pinch(now(), it.id, yawFor(cxRef.current));
    if (kind === "lit") play("light", it.x / 35);
    else if (kind === "chipped") play("tick", it.x / 35);
    setFrame((n) => n + 1);
  }

  const e = engine.current;
  const items = e && stage === "task" ? e.items("near") : [];
  const lit = new Set(e && stage === "task" ? e.litIds("near") : []);
  const r = SIZE[preset] / 2;
  const viewL = cx - VIEW / 2, viewR = cx + VIEW / 2;
  const inView = (x: number) => x > viewL + 1 && x < viewR - 1;
  const yaw = Math.round(yawFor(cx));
  const ms = useMemo(() => (session ? measures(session) : []), [session]);
  const leftAttention = session?.head.attention ? Math.round(session.head.attention.slice(0, 7).reduce((a, b) => a + b, 0) * 100) : null;

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <SkipLink />
      <AppHeader>
        <Button variant="ghost" size="sm" asChild><a href="/docs#safety" className="no-underline">Safety</a></Button>
      </AppHeader>
      <main id="main" tabIndex={-1} className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 outline-none sm:px-5 md:py-10">
        <div>
          <h1 className="m-0 text-[32px] font-semibold tracking-[-0.03em] md:text-[40px]">Try the table yourself</h1>
          <p className="m-0 mt-2 max-w-[62ch] text-muted-foreground">
            This runs the same engine as the Lens. Like the glasses, it only shows the diyas inside a window about as wide as your view at the table, so you have to turn your head to find them all. Light every whole diya; leave the chipped ones.
          </p>
        </div>

        {stage === "setup" && (
          <Card id="play-setup">
            <CardHeader><CardTitle>Set up</CardTitle><CardDescription>Headphones help: the hint is a bell in your left ear.</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-5 pt-3">
              <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
                <legend className="mb-2 text-[14px] font-medium">Level</legend>
                <div className="seg">
                  {(["easy", "standard", "hard"] as Preset[]).map((p) => (
                    <label key={p}><input type="radio" name="play-preset" value={p} checked={preset === p} onChange={() => setPreset(p)} /><span>{p[0].toUpperCase() + p.slice(1)}</span></label>
                  ))}
                </div>
              </fieldset>
              <label className="flex max-w-[60ch] items-start gap-3 text-[14.5px] leading-relaxed">
                <input id="feel-neglect" type="checkbox" className="mt-1 size-4 accent-[var(--left)]" checked={neglect} onChange={(ev) => setNeglect(ev.target.checked)} />
                <span><span className="font-medium">Feel neglect.</span> Fades the left part of whatever you look at, roughly how left spatial neglect feels from the inside: nothing seems missing, you just don't notice it. Turn further left to find what's there.</span>
              </label>
              <ul className="m-0 flex flex-col gap-1 pl-5 text-[14px] text-muted-foreground">
                <li>Move the mouse over the table, drag on a phone, or use the arrow keys to turn your head.</li>
                <li>Click or tap a diya to pinch it. Tab moves between the diyas in view.</li>
                <li>Stuck for 6 seconds with diyas still dark on the left? Listen.</li>
              </ul>
              <div><Button id="play-start" size="lg" onClick={start}><PlayIcon />Start</Button></div>
            </CardContent>
          </Card>
        )}

        {stage === "task" && (
          <section aria-labelledby="task-h" className="flex flex-col gap-3">
            <h2 id="task-h" className="sr-only">The table</h2>
            <div className="flex flex-wrap items-center justify-between gap-3 text-[14px] text-muted-foreground">
              <span id="head-yaw" className="tabular-nums">Head turned {yaw === 0 ? "straight ahead" : `${Math.abs(yaw)}° ${yaw > 0 ? "left" : "right"}`}</span>
              <span className="flex items-center gap-2"><Volume2 className="size-4" aria-hidden="true" />Sound on for the bell</span>
              <Button id="play-finish" variant="outline" size="sm" onClick={() => { engine.current?.finish(now()); finishTask(); }}>Finish</Button>
            </div>
            <div
              id="play-table"
              ref={tableRef}
              tabIndex={0}
              role="application"
              aria-roledescription="practice table"
              aria-label={`Practice table. Arrow keys turn your head; Tab moves between the diyas in view; Enter lights one. Head turned ${Math.abs(yaw)} degrees ${yaw >= 0 ? "left" : "right"}.`}
              onPointerMove={onPointer}
              onPointerDown={onPointer}
              onKeyDown={onKey}
              className="relative touch-none overflow-hidden rounded-2xl bg-night outline-none focus-visible:ring-2 focus-visible:ring-flame"
            >
              <svg viewBox={`${-W / 2 - 5} ${-D / 2 - 3} ${W + 10} ${D + 9}`} className="mx-auto block h-auto max-h-[62vh] w-full select-none">
                <defs>
                  <radialGradient id="nt-glow"><stop offset="0" stopColor="#ffb23f" stopOpacity=".55" /><stop offset="1" stopColor="#ffb23f" stopOpacity="0" /></radialGradient>
                  <linearGradient id="neglect-fade" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0" stopColor="#1c1611" stopOpacity="1" />
                    <stop offset="0.42" stopColor="#1c1611" stopOpacity="0.96" />
                    <stop offset="0.62" stopColor="#1c1611" stopOpacity="0" />
                  </linearGradient>
                  <clipPath id="view-clip"><rect x={viewL} y={-D / 2 - 3} width={VIEW} height={D + 6} /></clipPath>
                </defs>
                <rect x={-W / 2} y={-D / 2} width={W} height={D} rx="2" fill="#3a2a20" opacity=".55" />
                <rect x={viewL} y={-D / 2} width={VIEW} height={D} fill="#f6ede1" opacity=".05" />
                <g clipPath="url(#view-clip)">
                  <rect x={-W / 2} y={-D / 2} width="2.2" height={D} fill="#ffb347" opacity={cue === "hint1" ? 1 : BEAM_OPACITY[beam] ?? 0} className={cue === "hint1" ? "beam-pulse" : undefined} />
                  {cue === "hint2" && <rect x={-W / 2} y={-D / 2} width="8" height={D} fill="#ffb347" opacity=".35" className="beam-sweep" />}
                  {items.map((it) => {
                    const on = lit.has(it.id);
                    const visible = inView(it.x);
                    const label = it.kind === "whole" ? (on ? "Lit diya" : "Whole diya") : `Chipped diya, gap on the ${it.chip === "L" ? "left" : "right"}`;
                    return (
                      <g
                        key={it.id}
                        role="button"
                        tabIndex={visible ? 0 : -1}
                        aria-label={label}
                        aria-pressed={it.kind === "whole" ? on : undefined}
                        className="diya-btn"
                        onClick={() => pinch(it)}
                        onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); pinch(it); } }}
                      >
                        <circle className="hit" cx={it.x} cy={it.u - 0.8} r={r + 1.4} fill="transparent" />
                        <Lamp it={it} lit={on} />
                      </g>
                    );
                  })}
                  {neglect && <rect x={viewL} y={-D / 2 - 3} width={VIEW} height={D + 6} fill="url(#neglect-fade)" pointerEvents="none" />}
                </g>
                <rect x={viewL} y={-D / 2} width={VIEW} height={D} fill="none" stroke="#f6ede1" strokeOpacity=".25" strokeWidth=".3" strokeDasharray="1 1" pointerEvents="none" />
                <text x="0" y={D / 2 + 4.5} textAnchor="middle" fill="#bfae9c" fontSize="1.9">you sit here</text>
              </svg>
              {caption && cue !== "none" && (
                <p className="pointer-events-none absolute top-3 left-3 m-0 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[13px] text-[#f6ede1]">
                  <Bell className="size-3.5" aria-hidden="true" />{caption}
                </p>
              )}
            </div>
            <p className="sr-only" aria-live="assertive">{cue !== "none" ? caption : ""}</p>
            <p className="m-0 text-[13px] text-muted-foreground">The dashed box is what the glasses show right now. The table runs for up to 90 seconds.</p>
          </section>
        )}

        {stage === "done" && session && (
          <section aria-labelledby="result-h" className="flex flex-col gap-6">
            <h2 id="result-h" tabIndex={-1} className="m-0 text-[24px] font-semibold tracking-[-0.02em] outline-none">Your search</h2>
            <div className="grid items-start gap-6 lg:grid-cols-[1.3fr_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Replay and attention map</CardTitle>
                  <CardDescription>Numbers are the order you found the diyas; dashed circles were missed. The warm light is where your head pointed{leftAttention !== null ? `: ${leftAttention}% of the time on the left half` : ""}.</CardDescription>
                </CardHeader>
                <CardContent className="pt-3">
                  <div id="play-replay"><Replay session={session} replayKey={replayKey} /></div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setReplayKey((k) => k + 1)}><RotateCcw />Replay</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Report card</CardTitle><CardDescription>{session.summary}</CardDescription></CardHeader>
                <CardContent className="flex flex-col gap-3 pt-3">
                  <dl id="play-measures" className="m-0 grid gap-2">
                    {ms.map((m) => (
                      <div key={m.label} className="flex justify-between gap-4 border-b border-border pb-2 text-[14.5px] last:border-0">
                        <dt className="text-muted-foreground">{m.label}</dt><dd className="m-0 text-right font-medium tabular-nums">{m.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="m-0 text-[13px] text-muted-foreground">Practice result, not a diagnosis. Nothing you played here leaves this browser.</p>
                </CardContent>
              </Card>
            </div>
            {neglect && (
              <Alert variant="warn">
                <Eye className="size-4" aria-hidden="true" /> With Feel neglect on, the left of everything you looked at faded out. For many people after a right-hemisphere stroke, that is every day, and they don't know it's happening. The replay is how Purna shows them.
              </Alert>
            )}
            <div className="flex flex-wrap gap-2">
              <Button id="play-again" onClick={() => setStage("setup")}><RotateCcw />Play again</Button>
              <Button id="play-doctor" variant="outline" asChild><a href="/doctor#played" className="no-underline"><Stethoscope />See it as a therapist would</a></Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
