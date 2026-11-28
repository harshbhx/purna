import { ChevronDown, Copy, FileUp, LogOut, Play, Share2, Trash2, UserPlus } from "lucide-react";
import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AppHeader } from "@/components/purna/app-header";
import { Replay } from "@/components/purna/replay";
import { SessionCard } from "@/components/purna/session-card";
import { SiteFooter } from "@/components/purna/site-footer";
import { TrendChart } from "@/components/purna/trend-chart";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, parseImport } from "@/lib/api";
import { daysSince, fmtDate, fmtWhen } from "@/lib/format";
import { measures, therapistRows } from "@/lib/session";
import type { Me, SessionJson, Share } from "@/lib/types";
import { SkipLink } from "@/components/purna/skip-link";

type Msg = { kind: "success" | "danger" | "warn"; text: string } | null;
type Panel = null | "share" | "invite" | "import" | "delete";

async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button type="button" variant="outline" onClick={async () => { if (await copyText(text)) { setDone(true); setTimeout(() => setDone(false), 1600); } else window.prompt("Copy this:", text); }}>
      <Copy />{done ? "Copied ✓" : label}
    </Button>
  );
}

export function Dashboard(props: {
  me: Me;
  demo: boolean;
  familyKey: string | null;
  sessionsById: Map<string, SessionJson>;
  onReload: () => Promise<void>;
  onSignOut: () => void;
  onDeleted: () => void;
}) {
  const { me, demo, familyKey, sessionsById } = props;
  const [open, setOpen] = useState<SessionJson | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [replayKey, setReplayKey] = useState(0);
  const [shares, setShares] = useState<Share[]>(me.shares);
  const [newLink, setNewLink] = useState<string | null>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const [importText, setImportText] = useState("");
  const [confirm, setConfirm] = useState("");
  const opener = useRef<HTMLElement | null>(null);
  const remember = () => { opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; };
  const refocus = (e: Event) => { e.preventDefault(); opener.current?.focus(); };
  useEffect(() => setShares(me.shares), [me.shares]);
  useLayoutEffect(() => {
    // Open at the top, also after the browser settles focus and layout from the page we came from.
    const top = () => window.scrollTo({ top: 0, behavior: "instant" });
    top();
    const raf = requestAnimationFrame(top);
    return () => cancelAnimationFrame(raf);
  }, []);

  const newest = me.sessions[0];
  const earlier = me.sessions.slice(1);
  const points = useMemo(() => me.sessions.slice().reverse().map((c) => ({ date: c.startedAt, left: c.leftPct, right: c.rightPct })), [me.sessions]);
  const name = me.patient.name;

  async function openSession(id: string) {
    remember();
    let s = sessionsById.get(id);
    if (!s && familyKey) {
      try {
        s = (await api<{ session: SessionJson }>(`/me/sessions/${id}`, { auth: familyKey })).session;
        sessionsById.set(id, s);
      } catch (e) { setMsg({ kind: "danger", text: (e as Error).message }); return; }
    }
    if (s) { setReplayKey((k) => k + 1); setOpen(s); }
  }

  function closePanel(p: Panel) { remember(); setPanel(p); setMsg(null); setNewLink(null); }

  async function makeShare() {
    try {
      const r = await api<{ id: string; token: string; expiresAt: string }>("/me/shares", { method: "POST", body: { days: 7 }, auth: familyKey });
      setNewLink(`${location.origin}/doctor#t=${r.token}`);
      setShares((s) => [{ id: r.id, expiresAt: r.expiresAt, createdAt: new Date().toISOString() }, ...s]);
      setMsg(null);
    } catch (e) { setMsg({ kind: "danger", text: (e as Error).message }); }
  }
  async function stopShare(id: string) {
    try {
      await api(`/me/shares/${id}`, { method: "DELETE", auth: familyKey });
      setShares((s) => s.filter((x) => x.id !== id));
      setNewLink(null);
      setMsg({ kind: "success", text: "Stopped. That link no longer works." });
    } catch (e) { setMsg({ kind: "danger", text: (e as Error).message }); }
  }
  async function doImport(e: FormEvent) {
    e.preventDefault();
    const session = parseImport(importText);
    if (!session) return setMsg({ kind: "danger", text: "That doesn't look like a Purna session. Copy the whole line that starts with PURNA_SESSION." });
    try {
      const r = await api<{ duplicate?: boolean }>("/me/import", { method: "POST", body: { session }, auth: familyKey });
      setImportText("");
      setMsg({ kind: "success", text: r.duplicate ? "Already here. Nothing changed." : "Imported ✓" });
      await props.onReload();
    } catch (x) { setMsg({ kind: "danger", text: (x as Error).message }); }
  }
  async function doDelete(e: FormEvent) {
    e.preventDefault();
    try {
      await api("/me", { method: "DELETE", body: { confirm }, auth: familyKey });
      props.onDeleted();
    } catch (x) { setMsg({ kind: "danger", text: (x as Error).message }); }
  }

  const nudge = !newest
    ? "No practice yet. Start one on the glasses, then pinch Send to family."
    : !demo && daysSince(newest.startedAt) > 3
      ? `No practice since ${new Date(newest.startedAt).toLocaleDateString(undefined, { weekday: "long" })}. A few minutes today helps.`
      : null;

  return (
    <div id="dash" className="flex min-h-dvh flex-col bg-surface">
      <SkipLink />
      <AppHeader>
        {demo && <Badge id="demo-badge" variant="warn">Example</Badge>}
        {!demo && <Button variant="ghost" size="sm" onClick={props.onSignOut}><LogOut />Sign out here</Button>}
        {demo && <Button variant="outline" size="sm" asChild><a href="/#code" className="no-underline">Pair glasses</a></Button>}
      </AppHeader>

      <main id="main" tabIndex={-1} className="outline-none mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-5 md:py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="m-0 text-sm text-muted-foreground">{new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</p>
            <h1 className="m-0 mt-1 text-[32px] font-semibold tracking-[-0.03em] md:text-[40px]">{name}’s practice</h1>
          </div>
          {!demo && (
            <div id="tools" className="flex flex-wrap gap-2 no-print">
              <Button onClick={() => closePanel("share")}><Share2 />Share with doctor</Button>
              <Button variant="outline" onClick={() => closePanel("invite")}><UserPlus />Invite family</Button>
            </div>
          )}
        </div>

        {demo && <Alert variant="warn">This is an example with simulated data. Pair with a code from the glasses to see a real practice.</Alert>}
        {nudge && <Alert variant="warn" className="nudge">{nudge}</Alert>}
        {msg && panel === null && <Alert variant={msg.kind}>{msg.text}</Alert>}

        <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex min-w-0 flex-col gap-6">
            <div id="latest" className="flex flex-col gap-2">
              <h2 className="m-0 text-[15px] font-semibold text-muted-foreground">Latest session</h2>
              {newest ? <SessionCard c={newest} big onOpen={() => openSession(newest.id)} /> : <Card><CardContent className="text-muted-foreground">Sessions show up here after the first practice.</CardContent></Card>}
            </div>
            <section aria-labelledby="earlier-h" className="flex flex-col gap-3">
              <h2 id="earlier-h" className="m-0 text-[15px] font-semibold text-muted-foreground">Earlier sessions</h2>
              <div id="earlier" className="flex flex-col gap-3">
                {earlier.length ? earlier.map((c) => <SessionCard key={c.id} c={c} onOpen={() => openSession(c.id)} />) : <p className="m-0 text-muted-foreground">None yet.</p>}
              </div>
            </section>
          </div>
          <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-24">
            <Card>
              <CardHeader><CardTitle>Over time</CardTitle><CardDescription>Share of diyas found on each side. The solid line is the left side.</CardDescription></CardHeader>
              <CardContent id="trend" className="pt-3">{points.length ? <TrendChart points={points} /> : <p className="m-0 text-muted-foreground">The chart appears after the first session.</p>}</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Notes from the therapist</CardTitle></CardHeader>
              <CardContent id="notes" className="flex flex-col gap-3 pt-3">
                {me.notes.length ? me.notes.map((n) => (
                  <div key={n.id} className="note rounded-xl bg-warn-bg p-3.5 text-[15px] leading-relaxed whitespace-pre-wrap text-warn">
                    <span className="mb-1 block text-[12px] font-medium opacity-80">{fmtDate(n.createdAt, { day: "numeric", month: "long", year: "numeric" })}</span>{n.text}
                  </div>
                )) : <p className="m-0 text-[15px] text-muted-foreground">When the therapist writes a note on the doctor link, it shows here.</p>}
              </CardContent>
            </Card>
            {!demo && (
              <Card className="no-print">
                <CardHeader><CardTitle>Manage</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2 pt-3">
                  <Button variant="outline" onClick={() => closePanel("import")}><FileUp />Import from Logger</Button>
                  <Button variant="destructive-outline" onClick={() => closePanel("delete")}><Trash2 />Delete everything</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />

      {/* Session detail */}
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        {open && (
          <DialogContent wide aria-describedby="detail-summary" onCloseAutoFocus={refocus}>
            <DialogHeader>
              <DialogTitle id="detail-title">{fmtWhen(open.startedAt)}</DialogTitle>
              <DialogDescription id="detail-summary">{open.summary}</DialogDescription>
            </DialogHeader>
            <div className="rounded-2xl border border-border bg-surface p-3">
              <div id="detail-replay"><Replay session={open} replayKey={replayKey} /></div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-[13px] text-muted-foreground">Numbers: order found. Dashed: missed.</span>
                <Button variant="outline" size="sm" onClick={() => setReplayKey((k) => k + 1)}><Play />Replay</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {measures(open).map((m) => (
                <div key={m.label} className="measure rounded-xl border border-border p-3">
                  <p className="m-0 text-[12px] text-muted-foreground">{m.label}</p>
                  <p className="m-0 mt-1 text-[15px] leading-snug font-medium">{m.value}</p>
                </div>
              ))}
            </div>
            <Collapsible>
              <CollapsibleTrigger className="group flex h-11 w-full items-center justify-between rounded-xl border border-border px-3.5 text-[15px] font-medium hover:bg-muted">
                Details for the therapist<ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <dl className="m-0 mt-3 grid grid-cols-[max-content_1fr] gap-x-5 gap-y-1.5 text-sm">
                  {therapistRows(open).map(([k, v]) => <Fragment key={k}><dt className="text-muted-foreground">{k}</dt><dd className="m-0 tabular-nums">{v}</dd></Fragment>)}
                </dl>
              </CollapsibleContent>
            </Collapsible>
            <p className="m-0 text-[13px] text-muted-foreground">Practice result, not a diagnosis. Share it with your therapist.</p>
          </DialogContent>
        )}
      </Dialog>

      {/* Share with doctor */}
      <Dialog open={panel === "share"} onOpenChange={(o) => !o && setPanel(null)}>
        <DialogContent onCloseAutoFocus={refocus}>
          <DialogHeader>
            <DialogTitle>Share with doctor</DialogTitle>
            <DialogDescription>Makes a read-only link to every session. It stops working after 7 days, or when you stop it here.</DialogDescription>
          </DialogHeader>
          {newLink ? (
            <div id="share-new" className="flex flex-col gap-2">
              <p className="m-0 text-sm text-muted-foreground">Send this to the therapist. You’ll only see it once, so copy it now.</p>
              <div className="linkbox rounded-xl border border-dashed border-input bg-surface px-3 py-2.5 font-mono text-[13px] break-all">{newLink}</div>
              <div><CopyButton text={newLink} label="Copy link" /></div>
            </div>
          ) : (
            <Button onClick={makeShare}>Make a 7-day link</Button>
          )}
          {shares.length > 0 && (
            <div id="share-list" className="flex flex-col">
              <p className="m-0 mb-1 text-[13px] font-medium text-muted-foreground">Active links</p>
              {shares.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 border-t border-border py-2.5 text-sm">
                  <span>Made {fmtDate(s.createdAt)}, works until {fmtDate(s.expiresAt, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
                  <Button variant="ghost" size="sm" onClick={() => stopShare(s.id)}>Stop sharing</Button>
                </div>
              ))}
            </div>
          )}
          {msg && <div id="share-msg"><Alert variant={msg.kind}>{msg.text}</Alert></div>}
        </DialogContent>
      </Dialog>

      {/* Invite */}
      <Dialog open={panel === "invite"} onOpenChange={(o) => !o && setPanel(null)}>
        <DialogContent onCloseAutoFocus={refocus}>
          <DialogHeader>
            <DialogTitle>Invite family</DialogTitle>
            <DialogDescription>Send this link to a brother, sister or carer. Anyone with it can see this practice, so share it only with family.</DialogDescription>
          </DialogHeader>
          <div id="invite-link" className="rounded-xl border border-dashed border-input bg-surface px-3 py-2.5 font-mono text-[13px] break-all">{`${location.origin}/join#k=${familyKey ?? ""}`}</div>
          <DialogFooter><CopyButton text={`${location.origin}/join#k=${familyKey ?? ""}`} label="Copy invite link" /></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import */}
      <Dialog open={panel === "import"} onOpenChange={(o) => !o && setPanel(null)}>
        <DialogContent onCloseAutoFocus={refocus}>
          <form onSubmit={doImport} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Import from Logger</DialogTitle>
              <DialogDescription>If the glasses couldn’t send, copy the line that starts with PURNA_SESSION from the Lens Studio Logger and paste it here.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2"><Label htmlFor="import-text">Session line</Label><Textarea id="import-text" value={importText} onChange={(e) => setImportText(e.target.value)} spellCheck={false} className="font-mono text-[12px]" /></div>
            <div id="import-msg" className="empty:hidden">{msg && <Alert variant={msg.kind}>{msg.text}</Alert>}</div>
            <DialogFooter><Button type="submit">Import</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={panel === "delete"} onOpenChange={(o) => !o && setPanel(null)}>
        <DialogContent onCloseAutoFocus={refocus}>
          <form id="delete-panel" onSubmit={doDelete} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Delete everything?</DialogTitle>
              <DialogDescription>Removes every session, note, doctor link and the paired glasses. This can’t be undone.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2"><Label htmlFor="delete-confirm">Type “{name}” to confirm</Label><Input id="delete-confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" /></div>
            {msg && <Alert variant={msg.kind}>{msg.text}</Alert>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPanel(null)}>Cancel</Button>
              <Button type="submit" variant="destructive">Delete everything</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
