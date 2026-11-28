import { ChevronDown, Download, Printer } from "lucide-react";
import { Fragment, useEffect, useMemo, useState, type FormEvent } from "react";
import { AppHeader } from "@/components/purna/app-header";
import { Replay } from "@/components/purna/replay";
import { TrendChart } from "@/components/purna/trend-chart";
import CountUp from "@/components/reactbits/CountUp";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api, takeFragment } from "@/lib/api";
import { toCsv } from "@/lib/csv";
import { fix, fmtDate, titleCase } from "@/lib/format";
import { dayToDay, measures, progress, therapistRows } from "@/lib/session";
import { LookChart } from "@/components/purna/look-chart";
import { briefOf, suggestNext } from "../../../../Assets/Scripts/Core/Next";
import { ReferenceCard } from "@/components/purna/reference-card";
import type { DoctorData, Note, SessionJson } from "@/lib/types";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { SkipLink } from "@/components/purna/skip-link";

const TOKEN_KEY = "purna.doctorToken";
/** /doctor#demo: the same view filled with the labelled demo sessions, so anyone (judges included) can see it. */
const isDemo = () => typeof location !== "undefined" && location.hash === "#demo";

function readToken(): string | null {
  if (isDemo()) return null;
  const t = takeFragment("t");
  try {
    if (t) sessionStorage.setItem(TOKEN_KEY, t);
    return t ?? sessionStorage.getItem(TOKEN_KEY);
  } catch { return t; }
}

const COLS: [string, (s: SessionJson) => string][] = [
  ["Date", (s) => new Date(s.startedAt).toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })],
  ["Level", (s) => titleCase(s.settings.preset)],
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
  ["Max left", (s) => s.head.maxLeftDeg.toFixed(0) + "°"],
  ["Time left", (s) => Math.round(s.head.pctTimeLeft * 100) + "%"],
];

const GLOSSARY: [string, string][] = [
  ["CoC", "Centre of Cancellation, −1 to +1. Positive means the finds sat mostly on the right."],
  ["Ego asym", "Right minus left hits over all hits: neglect of the person’s own left."],
  ["Allo asym", "Chipped diyas lit with the gap on the left, minus on the right: neglect of each object’s left."],
  ["Best r", "How orderly the search was, from 0 to 1."],
];

export function Doctor() {
  const reduce = useReducedMotion();
  const [demo] = useState(isDemo);
  const [token] = useState(readToken);
  const [data, setData] = useState<DoctorData | null>(null);
  const [error, setError] = useState<string | null>(token || demo ? null : "This link is missing its key. Ask the family to copy it again.");
  const [notes, setNotes] = useState<Note[]>([]);
  const [note, setNote] = useState("");
  const [noteMsg, setNoteMsg] = useState<{ kind: "success" | "danger"; text: string } | null>(null);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!demo) return;
    fetch("/demo/sessions.json")
      .then((r) => r.json() as Promise<SessionJson[]>)
      .then((ss) => {
        const sessions = ss.slice().sort((a, b) => b.startedAt.localeCompare(a.startedAt));
        const notes: Note[] = [{ id: "demo", text: "Example note: a good week. The left side is coming back; keep the 6 s hints.", createdAt: sessions[0]?.startedAt ?? new Date().toISOString() }];
        setData({ patient: { name: "Papa" }, expiresAt: new Date(Date.now() + 7 * 864e5).toISOString(), sessions, notes });
        setNotes(notes);
        if (sessions[0]) setOpenIds(new Set([sessions[0].sessionId]));
      })
      .catch(() => setError("The example couldn't load. Refresh to try again."));
  }, [demo]);

  useEffect(() => {
    if (!token) return;
    api<DoctorData>("/doctor", { auth: token })
      .then((d) => { setData(d); setNotes(d.notes); if (d.sessions[0]) setOpenIds(new Set([d.sessions[0].sessionId])); })
      .catch((e) => setError((e as Error).message));
  }, [token]);

  const prog = useMemo(() => (data ? progress(data.sessions) : null), [data]);

  async function sendNote(e: FormEvent) {
    e.preventDefault();
    const text = note.trim();
    if (!text) return setNoteMsg({ kind: "danger", text: "Write a note first." });
    try {
      await api("/doctor/notes", { method: "POST", body: { text }, auth: token });
      setNote("");
      setNoteMsg({ kind: "success", text: "Saved. The family will see it on their page." });
      const d = await api<DoctorData>("/doctor", { auth: token });
      setNotes(d.notes);
    } catch (x) { setNoteMsg({ kind: "danger", text: (x as Error).message }); }
  }

  function downloadCsv() {
    if (!data) return;
    const blob = new Blob([toCsv(data.sessions)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `purna-${data.patient.name.replace(/[^\w-]+/g, "_")}.csv`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  const points = data ? data.sessions.slice().reverse().map((s) => ({ date: s.startedAt, left: s.near.leftTotal ? s.near.leftHits / s.near.leftTotal : null, right: s.near.rightTotal ? s.near.rightHits / s.near.rightTotal : null })) : [];
  const band = dayToDay(points.map((p) => p.left));
  const cocs = data ? data.sessions.map((s) => s.near.coc) : [];
  const earlierCocs = cocs.slice(1).filter((c): c is number => c !== null);

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <SkipLink />
      <AppHeader>
        <Badge variant="outline" className="hidden sm:inline-flex">{demo ? "Example therapist view" : "Therapist view, read only"}</Badge>
        {data && data.sessions.length > 0 && <Button variant="outline" size="sm" onClick={downloadCsv}><Download />Download CSV</Button>}
        {data && <Button variant="outline" size="sm" onClick={() => { setOpenIds(new Set(data.sessions.map((s) => s.sessionId))); setTimeout(() => window.print(), 50); }}><Printer />Print</Button>}
      </AppHeader>
      <main id="main" tabIndex={-1} className="outline-none mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-5 md:py-10">
        {error && <div id="out"><Alert variant="danger">{error}</Alert></div>}
        {demo && data && <Alert id="demo-banner" variant="warn">Example: simulated sessions from Purna’s test players, not a real person. Saving notes is switched off here.</Alert>}
        {!error && !data && <p className="text-muted-foreground">Loading…</p>}
        {data && (
          <div id="view" className="flex flex-col gap-6">
            <div>
              <h1 className="m-0 text-[32px] font-semibold tracking-[-0.03em] md:text-[40px]">{data.patient.name}: Purna practice</h1>
              <p className="m-0 mt-2 text-muted-foreground">Practice results from SPECS glasses, not a diagnostic test. This link works until {fmtDate(data.expiresAt, { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" })}.</p>
            </div>

            {data.sessions.length > 0 && (() => {
              const next = suggestNext(data.sessions.slice(0, 3).map(briefOf));
              return (
                <p id="next-step" className="m-0 rounded-2xl border border-border bg-card px-4 py-3 text-[14.5px] leading-relaxed">
                  <span className="font-semibold">The glasses will suggest next: </span>{next.reason}{" "}
                  <span className="text-muted-foreground">The family can change it on the setup panel, and your note can too.</span>
                </p>
              );
            })()}

            {prog && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { l: "Left side found", a: Math.round(prog.left[0] * 100), b: Math.round(prog.left[1] * 100), suf: "%", d: 0, sub: `first ${prog.k} sessions vs last ${prog.k}` },
                  { l: "Centre of Cancellation", a: prog.coc[0], b: prog.coc[1], suf: "", d: 2, sub: "0 is balanced; positive leans right" },
                  { l: "Hints per session", a: prog.hints[0], b: prog.hints[1], suf: "", d: 1, sub: `first ${prog.k} vs last ${prog.k}` },
                  { l: "Sessions", a: null, b: data.sessions.length, suf: "", d: 0, sub: `${fmtDate(data.sessions[data.sessions.length - 1].startedAt)} to ${fmtDate(data.sessions[0].startedAt)}` },
                ].map((t) => (
                  <Card key={t.l}><CardContent>
                    <p className="m-0 text-[13px] text-muted-foreground">{t.l}</p>
                    <p className="m-0 mt-1.5 text-[26px] font-semibold tracking-[-0.02em] tabular-nums">
                      {t.a !== null && <>{t.a.toFixed(t.d)}{t.suf} → </>}
                      {reduce ? t.b.toFixed(t.d) : <CountUp to={Number(t.b.toFixed(t.d))} decimals={t.d} duration={1.2} />}{t.suf}
                    </p>
                    <p className="m-0 mt-1 text-[13px] text-muted-foreground">{t.sub}</p>
                  </CardContent></Card>
                ))}
              </div>
            )}

            <Card className="overflow-hidden">
                  <CardHeader><CardTitle>Sessions</CardTitle></CardHeader>
                  <div className="pt-3">
                    {data.sessions.length ? (
                      <Table id="table" label="Every session, scrolls sideways">
                        <TableCaption>Every session, newest first</TableCaption>
                        <TableHeader><TableRow>{COLS.map(([h]) => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader>
                        <TableBody>{data.sessions.map((s) => <TableRow key={s.sessionId}>{COLS.map(([h, f]) => <TableCell key={h}>{f(s)}</TableCell>)}</TableRow>)}</TableBody>
                      </Table>
                    ) : <p className="px-5 pb-5 text-muted-foreground">No sessions yet.</p>}
                  </div>
                </Card>
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="flex min-w-0 flex-col gap-6">
                <Card>
                  <CardHeader><CardTitle>Share of diyas found, per side</CardTitle><CardDescription>Solid: left. Dashed: right.</CardDescription></CardHeader>
                  <CardContent id="trend" className="pt-3">
                    {points.length ? <TrendChart points={points} band={band} /> : <p className="m-0 text-muted-foreground">No sessions yet.</p>}
                    {band && <p id="band-note" className="m-0 mt-2 text-[13px] text-muted-foreground">Shaded: {data!.patient.name}’s usual change from one session to the next (±{Math.round(band.spread * 100)} points). A change inside it may be chance.</p>}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Where the time went</CardTitle><CardDescription>Seconds to find a diya in each third of the table. A long left bar means the left took longer to search.</CardDescription></CardHeader>
                  <CardContent id="look" className="pt-3"><LookChart sessions={data!.sessions} /></CardContent>
                </Card>
                <ReferenceCard latestCoc={cocs[0] ?? null} earlierCoc={earlierCocs.length ? earlierCocs.reduce((a, b) => a + b, 0) / earlierCocs.length : null} />
                <section aria-labelledby="replays-h" className="flex flex-col gap-3">
                  <h2 id="replays-h" className="m-0 text-[17px] font-semibold">Session replays</h2>
                  {data.sessions.slice(0, 20).map((s) => {
                    const isOpen = openIds.has(s.sessionId);
                    return (
                      <Collapsible key={s.sessionId} open={isOpen} onOpenChange={(o) => setOpenIds((prev) => { const n = new Set(prev); o ? n.add(s.sessionId) : n.delete(s.sessionId); return n; })}>
                        <Card>
                          <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                            <span><span className="block text-[13px] text-muted-foreground">{new Date(s.startedAt).toLocaleString()}</span><span className="text-[15px]">{s.summary}</span></span>
                            <ChevronDown className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="grid gap-5 border-t border-border p-5 md:grid-cols-[1.2fr_1fr]">
                              <Replay session={s} animate={false} />
                              <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-2 gap-2">{measures(s).map((m) => <div key={m.label} className="rounded-xl border border-border p-2.5"><p className="m-0 text-[12px] text-muted-foreground">{m.label}</p><p className="m-0 mt-0.5 text-[14px] font-medium">{m.value}</p></div>)}</div>
                                <dl className="m-0 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-[13px]">{therapistRows(s).map(([k, v]) => <Fragment key={k}><dt className="text-muted-foreground">{k}</dt><dd className="m-0 tabular-nums">{v}</dd></Fragment>)}</dl>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    );
                  })}
                </section>
              </div>

              <aside className="flex flex-col gap-6">
                {!demo && <Card className="no-print">
                  <CardHeader><CardTitle>Note for the family</CardTitle></CardHeader>
                  <CardContent className="pt-3">
                    <form id="note-form" onSubmit={sendNote} className="flex flex-col gap-3">
                      <Label htmlFor="note">Add a note for the family</Label>
                      <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} placeholder="e.g. Good effort. Try hint delay 4 s next week." />
                      {noteMsg && <Alert variant={noteMsg.kind}>{noteMsg.text}</Alert>}
                      <Button type="submit">Save note</Button>
                    </form>
                  </CardContent>
                </Card>}
                <Card>
                  <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                  <CardContent id="notes" className="flex flex-col gap-3 pt-3">
                    {notes.length ? notes.map((n) => (
                      <div key={n.id} className="note border-l-2 border-flame pl-3 text-[14px] leading-relaxed whitespace-pre-wrap"><span className="block text-[12px] text-muted-foreground">{fmtDate(n.createdAt, { day: "numeric", month: "long", year: "numeric" })}</span>{n.text}</div>
                    )) : <p className="m-0 text-[14px] text-muted-foreground">No notes yet.</p>}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>What the measures mean</CardTitle></CardHeader>
                  <CardContent className="pt-3">
                    <dl className="m-0 flex flex-col gap-3">{GLOSSARY.map(([k, v]) => <div key={k}><dt className="text-[14px] font-semibold">{k}</dt><dd className="m-0 mt-0.5 text-[13px] leading-relaxed text-muted-foreground">{v}</dd></div>)}</dl>
                  </CardContent>
                </Card>
              </aside>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
