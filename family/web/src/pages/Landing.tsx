import { BellRing, Clock, Glasses, Hand, Lock, Route, Send, ShieldCheck, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { DotBackground } from "@/components/aceternity/dot-background";
import { LampContainer } from "@/components/aceternity/lamp";
import { Spotlight } from "@/components/aceternity/spotlight";
import { Timeline } from "@/components/aceternity/timeline";
import { NightTable } from "@/components/purna/night-table";
import { Replay } from "@/components/purna/replay";
import { SessionCard } from "@/components/purna/session-card";
import { SiteFooter } from "@/components/purna/site-footer";
import { SiteHeader } from "@/components/purna/site-header";
import { ThreeSearchers } from "@/components/purna/three-searchers";
import { TrendChart } from "@/components/purna/trend-chart";
import BlurText from "@/components/reactbits/BlurText";
import CountUp from "@/components/reactbits/CountUp";
import Magnet from "@/components/reactbits/Magnet";
import ShinyText from "@/components/reactbits/ShinyText";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { fix, fmtDate } from "@/lib/format";
import { progress, toCard } from "@/lib/session";
import type { SessionJson } from "@/lib/types";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { SkipLink } from "@/components/purna/skip-link";

const HEADLINE = "Practice that makes the world whole again.";

function Section({ id, labelledBy, className, children }: { id?: string; labelledBy: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={className}>
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">{children}</div>
    </section>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return <h2 id={id} className="m-0 max-w-[20ch] text-[32px] leading-[1.1] font-semibold tracking-[-0.03em] text-balance md:text-[44px]">{children}</h2>;
}

export function Landing({ demo, onPaired, onExample }: { demo: SessionJson[]; onPaired: (key: string) => void; onExample: () => void }) {
  const reduce = useReducedMotion();
  const recent = useMemo(() => demo.slice().sort((a, b) => b.startedAt.localeCompare(a.startedAt)), [demo]);
  const healthy = demo.find((s) => s.near.leftHits === s.near.leftTotal && s.near.fpChipLeft === 0) ?? demo[0];
  const neglect = demo.find((s) => s.near.leftHits < s.near.leftTotal) ?? demo[0];
  const prog = progress(recent);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function pair(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return setErr("Type the code shown on the glasses, like DIYA-7K3P.");
    if (!name.trim()) return setErr("Type what you call them, like Papa or Ramesh.");
    setBusy(true);
    try {
      const r = await api<{ familyKey: string }>("/pair", { method: "POST", body: { code, name } });
      setErr("");
      onPaired(r.familyKey);
    } catch (x) {
      setErr((x as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const steps = [
    { title: "Put the glasses on", icon: <Glasses />, content: "Someone at home starts it in ten seconds and picks Easy, Standard or Hard. Nothing is shared unless they turn sharing on." },
    { title: "Light the whole diyas", icon: <Hand />, content: "Clay diyas appear across the real dining table. A pinch lights a whole one. Chipped ones are left alone." },
    { title: "A hint from the left, never the answer", icon: <BellRing />, content: "Stuck on the right for six seconds? A temple bell rings from the left and a soft beam sweeps there. It points to the side, not to a diya, so the searching stays theirs." },
    { title: "See their own search", icon: <Route />, content: "A glowing thread replays the order they found the diyas. The ones they missed show where they were." },
    { title: "Send it home", icon: <Send />, content: "One pinch sends the session to the family page. New glasses show a code like DIYA-7K3P, typed in once." },
  ];

  const reasons = [
    { t: "They see their own search", b: "People with neglect often don’t know what they missed. Showing patients where they looked during search improved neglect and self-awareness in a crossover study.", src: "Kobe University", href: "https://da.lib.kobe-u.ac.jp/da/kernel/D1008330/D1008330.pdf" },
    { t: "Movement only drifts left", b: "Following motion to the left reduces neglect; motion to the right may make it worse. Purna’s warm-up never moves anything rightward, and a test checks it.", src: "Review", href: "https://www.elsevier.es/es-revista-international-journal-clinical-health-psychology-355-articulo-virtual-reality-eye-movement-training-S1697260025000870" },
    { t: "Some diyas are chipped", b: "Neglect can be about the left side of each object, not only your own left. Shapes with a gap on one side tell the two apart, as in the Ota test.", src: "Ota et al.", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3358702" },
    { t: "The family watches, the therapist decides", b: "Family-led rehabilitation didn’t reduce death or dependency in India’s ATTEND trial. Purna gives families visibility and leaves therapy to the therapist.", src: "Lancet, 2017", href: "https://researchonline.lshtm.ac.uk/4052645" },
  ];

  const privacy = [
    { icon: <Glasses />, t: "Nothing identifying leaves the glasses", b: "No name, face, camera image or location. The family types the name they use at home." },
    { icon: <Lock />, t: "Keys kept as fingerprints", b: "Family keys and doctor links are stored only as one-way hashes, so even a copy of the database can’t open a page." },
    { icon: <Clock />, t: "Doctor links expire", b: "Seven days by default, and you can stop one at any time." },
    { icon: <Trash2 />, t: "One button deletes it all", b: "Sessions, notes, links and the paired glasses, gone for good." },
  ];

  return (
    <div id="landing" className="bg-background">
      <SkipLink />
      <SiteHeader onExample={onExample} />
      <main id="main" tabIndex={-1} className="outline-none">
        {/* Hero */}
        <section id="top" aria-labelledby="hero-h" className="relative overflow-hidden">
          <DotBackground />
          <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pt-12 pb-20 md:pt-20 lg:grid-cols-[1fr_1.2fr] lg:gap-14 lg:pb-28">
            <div>
              <p className="m-0 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-sm shadow-sm backdrop-blur">
                <span className="size-1.5 rounded-full bg-flame" aria-hidden="true" />
                <ShinyText text="For people with left neglect after a stroke" color="#6b6760" shineColor="#17140f" speed={3} />
              </p>
              <h1 id="hero-h" aria-label={HEADLINE} className="mt-6 mb-0 text-[44px] leading-[1.02] font-semibold tracking-[-0.04em] text-balance sm:text-[56px] lg:text-[64px]">
                {reduce ? HEADLINE : <BlurText text={HEADLINE} animateBy="words" delay={90} direction="top" className="inline" />}
              </h1>
              <p className="mt-6 mb-0 max-w-[34ch] text-lg leading-relaxed text-muted-foreground md:text-xl">
                Four minutes a day on SPECS glasses, at their own dining table. Their family sees how it went. Their therapist gets the numbers.
              </p>
              <div className="hero-actions mt-8 flex flex-wrap items-center gap-3">
                <Magnet padding={40} magnetStrength={4}>
                  <Button size="lg" onClick={onExample}>See an example</Button>
                </Magnet>
                <Button asChild size="lg" variant="outline"><a href="#code" className="no-underline">I have a code</a></Button>
              </div>
              <p className="mt-5 mb-0 flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="size-4" aria-hidden="true" />A practice tool, not a medical device.</p>
            </div>
            <div className="relative">
              <div aria-hidden="true" className="absolute -inset-6 -z-10 rounded-[40px] bg-[radial-gradient(60%_60%_at_60%_40%,rgba(245,158,11,0.18),transparent_70%)]" />
              <div className="rounded-[28px] bg-night p-4 shadow-[0_1px_0_#2a211a_inset,0_40px_80px_-32px_rgba(28,22,17,0.6)] ring-1 ring-black/5 md:p-5">
                <div className="flex items-center justify-between px-1 pb-3 text-[13px] text-night-muted">
                  <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-flame" aria-hidden="true" />Through the glasses</span>
                  <span>Standard, 6 s hints</span>
                </div>
                <NightTable session={healthy} />
              </div>
            </div>
          </div>
        </section>

        {/* Problem */}
        <Section labelledBy="problem-h" className="border-t border-border">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
            <H2 id="problem-h">After a stroke, half the world can go quiet.</H2>
            <div className="flex flex-col gap-5 text-lg leading-relaxed text-foreground/85">
              <p className="m-0">Many people who have a stroke on the right side of the brain stop noticing things on their left. They leave half the plate, miss the first words of a line, bump the left door frame. Their eyes work. Their attention doesn’t, and they usually don’t know it.</p>
              <p className="m-0">It’s called left spatial neglect. Therapists train it with paper scanning sheets in the clinic. Purna brings that practice home, and measures it.</p>
            </div>
          </div>
          <dl className="mt-14 grid gap-4 sm:grid-cols-3">
            {[
              { n: 40, suffix: "%", label: "of right-hemisphere strokes are followed by neglect, roughly", src: "UEA review", href: "https://ueaeprints.uea.ac.uk/id/eprint/78250/1/Accepted_Manuscript.pdf" },
              { n: 7.6, suffix: "%", decimals: 1, label: "of stroke survivors got occupational therapy in a multicentre Indian study", src: "INSPIRE", href: "https://pubmed.ncbi.nlm.nih.gov/37114983/" },
              { n: 4, suffix: " min", label: "a day of practice at the dining table, started by the family in ten seconds", src: "Purna", href: "#how" },
            ].map((f) => (
              <div key={f.src} className="rounded-2xl border border-border bg-surface p-6">
                <dt className="sr-only">{f.src}</dt>
                <dd className="m-0">
                  <span className="block text-[44px] leading-none font-semibold tracking-[-0.04em] tabular-nums">
                    {reduce ? `${f.n}${f.suffix}` : <CountUp to={f.n} decimals={f.decimals ?? 0} suffix={f.suffix} duration={1.6} />}
                  </span>
                  <span className="mt-3 block text-[15px] leading-relaxed text-muted-foreground">{f.label} (<a href={f.href}>{f.src}</a>)</span>
                </dd>
              </div>
            ))}
          </dl>
        </Section>

        {/* Session */}
        <Section id="how" labelledBy="how-h" className="border-t border-border bg-surface">
          <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] [&>*]:min-w-0">
            <div>
              <H2 id="how-h">A session at the table</H2>
              <p className="mt-4 mb-12 max-w-[46ch] text-lg leading-relaxed text-muted-foreground">No score, no timer, no failure sounds. Just lamps to light, and a hint from the left when they need one.</p>
              <div className="steps"><Timeline data={steps} /></div>
            </div>
            <figure className="m-0 self-start lg:sticky lg:top-24">
              <div className="rounded-3xl border border-border bg-card p-5 shadow-[0_24px_48px_-32px_rgba(23,20,15,0.3)]">
                <div className="mb-3 flex items-center justify-between text-[13px] text-muted-foreground"><span>Replay of a practice session</span><span>{fmtDate(neglect.startedAt, { weekday: "short", day: "numeric", month: "short" })}</span></div>
                <div id="landing-replay"><Replay session={neglect} /></div>
              </div>
              <figcaption className="mt-3 text-sm leading-relaxed text-muted-foreground">Numbers are the order they found the diyas, dashed circles were missed, open rings are chipped diyas. Example from a simulated player.</figcaption>
            </figure>
          </div>
        </Section>

        {/* Reading a session */}
        <Section id="read" labelledBy="read-h" className="border-t border-border">
          <H2 id="read-h">Three ways to search the same table</H2>
          <p className="mt-4 mb-10 max-w-[60ch] text-lg leading-relaxed text-muted-foreground">One layout, three simulated searchers, run through the real Purna engine. Switch between them to see what each measure catches. These are scripted players, not patients.</p>
          <ThreeSearchers />
        </Section>

        {/* Families */}
        <Section id="families" labelledBy="fam-h" className="border-t border-border">
          <div className="grid items-center gap-14 lg:grid-cols-2 [&>*]:min-w-0">
            <div>
              <H2 id="fam-h">What the family sees</H2>
              <p className="mt-4 mb-8 max-w-[44ch] text-lg leading-relaxed text-muted-foreground">Children who live in another city can follow every session, without reading a chart.</p>
              <ul className="m-0 flex list-none flex-col gap-3.5 p-0 text-[16px]">
                {["One plain sentence for every session", "The left and right side as two bars", "A trend line that shows the left side coming back", "A gentle reminder after three quiet days, never a notification", "Brothers and sisters join with one invite link"].map((t) => (
                  <li key={t} className="flex items-start gap-3"><span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-flame" />{t}</li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <div id="family-preview" aria-label="Example of the family page" className="w-full max-w-[360px] rounded-[40px] border-[10px] border-[#17140f] bg-background p-5 shadow-[0_40px_80px_-40px_rgba(23,20,15,0.5)]">
                <p className="m-0 text-[13px] text-muted-foreground">Example</p>
                <p className="m-0 mt-0.5 mb-4 text-2xl font-semibold tracking-[-0.025em]">Papa’s practice</p>
                <SessionCard c={toCard(recent[0])} />
                <div className="mt-4 rounded-2xl border border-border bg-card p-3">
                  <p className="m-0 mb-1 text-[13px] font-semibold">Over {recent.length} sessions</p>
                  <TrendChart points={recent.slice().reverse().map((s) => ({ date: s.startedAt, left: s.near.leftHits / s.near.leftTotal, right: s.near.rightHits / s.near.rightTotal }))} height={170} />
                </div>
                <div className="mt-4 rounded-2xl bg-warn-bg p-3.5 text-[14px] leading-relaxed text-warn"><b className="font-semibold">Note from the therapist</b><br />Good progress on the left. Keep hints at 6 s; try Hard on Friday.</div>
              </div>
            </div>
          </div>
        </Section>

        {/* Therapists */}
        <Section id="therapists" labelledBy="doc-h" className="border-t border-border bg-surface">
          <div className="grid items-center gap-14 lg:grid-cols-[1.25fr_1fr]">
            <div className="order-2 min-w-0 lg:order-1">
              {prog && (
                <div className="mb-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { l: "Left side found", a: prog.left[0] * 100, b: prog.left[1] * 100, s: "%" },
                    { l: "Hints per session", a: prog.hints[0], b: prog.hints[1], s: "", d: 1 },
                    { l: "Centre of Cancellation", a: prog.coc[0], b: prog.coc[1], s: "", d: 2 },
                  ].map((t) => (
                    <div key={t.l} className="rounded-2xl border border-border bg-card p-4">
                      <p className="m-0 text-[13px] text-muted-foreground">{t.l}</p>
                      <p className="m-0 mt-1.5 text-[22px] font-semibold tracking-[-0.02em] tabular-nums">{t.d ? t.a.toFixed(t.d) : Math.round(t.a)}{t.s} → {reduce ? (t.d ? t.b.toFixed(t.d) : Math.round(t.b)) : <CountUp to={Number(t.d ? t.b.toFixed(t.d) : Math.round(t.b))} decimals={t.d ?? 0} duration={1.4} />}{t.s}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_48px_-32px_rgba(23,20,15,0.3)]">
                <div className="flex items-center justify-between border-b border-border px-4 py-3 text-[13px] text-muted-foreground"><span>Papa: Purna practice</span><span>Read only, 7-day link</span></div>
                <Table id="doctor-preview" label="Example therapist table, scrolls sideways">
                  <TableCaption>Example sessions as the therapist sees them</TableCaption>
                  <TableHeader><TableRow>{["Date", "Left", "Right", "CoC", "Ego asym", "Hints", "Max left"].map((h) => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader>
                  <TableBody>
                    {recent.slice(0, 5).map((s) => (
                      <TableRow key={s.sessionId}>
                        <TableCell>{fmtDate(s.startedAt)}</TableCell>
                        <TableCell>{s.near.leftHits}/{s.near.leftTotal}</TableCell>
                        <TableCell>{s.near.rightHits}/{s.near.rightTotal}</TableCell>
                        <TableCell>{fix(s.near.coc)}</TableCell>
                        <TableCell>{fix(s.near.egoAsym)}</TableCell>
                        <TableCell>{s.cues.hint1 + s.cues.hint2}</TableCell>
                        <TableCell>{Math.round(s.head.maxLeftDeg)}°</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="mt-2 mb-0 text-[13px] text-muted-foreground">First three sessions against the last three, from the example data.</p>
            </div>
            <div className="order-1 min-w-0 lg:order-2">
              <H2 id="doc-h">What the therapist gets</H2>
              <p className="mt-4 mb-8 text-lg leading-relaxed text-muted-foreground">A read-only link that lasts seven days. Every session, with the numbers a cancellation test gives.</p>
              <ul className="m-0 flex list-none flex-col gap-3.5 p-0 text-[16px]">
                {["Centre of Cancellation, and asymmetry for the person’s left and each object’s left", "Search order, path crossings, revisits and head turn", "A 2D replay of every session", "CSV download, a print layout, and notes back to the family"].map((t) => (
                  <li key={t} className="flex items-start gap-3"><span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-flame" />{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* Research */}
        <Section id="research" labelledBy="res-h" className="border-t border-border">
          <H2 id="res-h">Why it’s built this way</H2>
          <p className="mt-4 mb-12 text-lg text-muted-foreground">Every choice traces to a published finding. <a href="https://github.com/harshbhx/purna/blob/main/docs/10-RESEARCH.md">Read all the research</a></p>
          <div className="grid gap-4 md:grid-cols-2">
            {reasons.map((r) => (
              <SpotlightCard key={r.t} theme="light" spotlightColor="rgba(245, 158, 11, 0.22)" className="rounded-3xl p-7">
                <h3 className="m-0 text-xl font-semibold tracking-[-0.015em]">{r.t}</h3>
                <p className="mt-3 mb-0 text-[16px] leading-relaxed text-muted-foreground">{r.b} <a href={r.href}>{r.src}</a></p>
              </SpotlightCard>
            ))}
          </div>
        </Section>

        {/* Privacy */}
        <Section labelledBy="priv-h" className="border-t border-border bg-surface">
          <H2 id="priv-h">Private by design</H2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {privacy.map((p) => (
              <div key={p.t}>
                <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm [&_svg]:size-5" aria-hidden="true">{p.icon}</span>
                <h3 className="mt-4 mb-1.5 text-[17px] font-semibold">{p.t}</h3>
                <p className="m-0 text-[15px] leading-relaxed text-muted-foreground">{p.b}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Code: under the lamp */}
        <section id="code" aria-labelledby="code-h" className="dark-band">
          <LampContainer>
            <div className="mx-auto flex max-w-xl flex-col items-center text-center">
              <h2 id="code-h" className="m-0 bg-gradient-to-b from-[#fff7ea] to-[#d9c3a6] bg-clip-text text-[34px] leading-tight font-semibold tracking-[-0.03em] text-transparent md:text-[48px]">Have a code from the glasses?</h2>
              <p className="mt-4 mb-0 text-lg leading-relaxed text-night-muted">After the first session the glasses show a code. Type it here once and you’ll see every practice from then on.</p>
              <form id="pair" noValidate onSubmit={pair} className="mt-10 w-full rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-left backdrop-blur md:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="pair-code" className="text-night-muted">Code</Label>
                    <Input id="pair-code" name="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="DIYA-7K3P" autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={12}
                      className="border-white/15 bg-white/5 tracking-[0.12em] text-night-foreground uppercase placeholder:text-night-muted/60 focus-visible:border-flame focus-visible:ring-flame/25" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="pair-name" className="text-night-muted">What do you call them?</Label>
                    <Input id="pair-name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Papa" autoComplete="off" maxLength={40}
                      className="border-white/15 bg-white/5 text-night-foreground placeholder:text-night-muted/60 focus-visible:border-flame focus-visible:ring-flame/25" />
                  </div>
                </div>
                <div id="pair-msg" className="mt-3 empty:hidden">{err && <Alert variant="danger">{err}</Alert>}</div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Button type="submit" variant="flame" size="lg" disabled={busy}>See their practice</Button>
                  <Button type="button" variant="night" size="lg" onClick={onExample}>See an example</Button>
                </div>
              </form>
            </div>
          </LampContainer>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
