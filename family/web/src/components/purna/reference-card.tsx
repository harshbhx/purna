// Context from published cancellation tests. Deliberately not a cut-off: those numbers come from paper tests with
// more targets and a fixed page, and fixed cut-offs give many false positives when few targets are found.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { COC_REFERENCE } from "@/lib/session";
import { fix } from "@/lib/format";

export function ReferenceCard({ latestCoc, earlierCoc }: { latestCoc: number | null; earlierCoc: number | null }) {
  const pos = (v: number) => 50 + Math.max(-1, Math.min(1, v)) * 50;
  return (
    <Card id="reference">
      <CardHeader>
        <CardTitle>Context from published tests</CardTitle>
        <CardDescription>For orientation only. Purna is a practice tool; use a standard assessment to diagnose.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 pt-3">
        <div>
          <div className="text-[14px] font-semibold">Centre of Cancellation</div>
          <div role="img" className="relative mt-3 h-14"
            aria-label={`Centre of Cancellation scale from −1 (left) to +1 (right). Latest ${latestCoc === null ? "none" : fix(latestCoc)}${earlierCoc === null ? "" : `, earlier ${fix(earlierCoc)}`}. Dashed line at ${COC_REFERENCE}, the Bells Test reference.`}>
            <div className="absolute inset-x-0 top-5 h-px bg-border" />
            <div className="absolute top-3 left-1/2 h-4 w-px bg-muted-foreground/50" />
            <div className="absolute top-1 h-8 border-l-2 border-dashed border-flame" style={{ left: `${pos(COC_REFERENCE)}%` }} />
            {earlierCoc !== null && <div className="absolute top-5 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-muted-foreground bg-card" style={{ left: `${pos(earlierCoc)}%` }} />}
            {latestCoc !== null && <div className="absolute top-5 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-foreground" style={{ left: `${pos(latestCoc)}%` }} />}
            <span className="absolute bottom-0 left-0 text-[11px] text-muted-foreground">−1 left</span>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[11px] text-muted-foreground">0</span>
            <span className="absolute right-0 bottom-0 text-[11px] text-muted-foreground">+1 right</span>
          </div>
          <p className="m-0 mt-2 text-[13px] leading-relaxed text-muted-foreground">
            Filled dot: latest session{earlierCoc !== null ? "; open dot: earlier sessions" : ""}. Dashed line: on paper tests, an acute score above {COC_REFERENCE} on the Bells Test
            (0.083 on Letter Cancellation) indicated neglect after right-hemisphere stroke (Rorden &amp; Karnath, 2010).
          </p>
        </div>
        <div>
          <div className="text-[14px] font-semibold">Egocentric and allocentric asymmetry</div>
          <p className="m-0 mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Scored the way the Apples Test scores them (Bickerton et al., 2011). The Apples Test has its own standardised cut-offs, which don't carry over to Purna's 12 whole and 12 chipped diyas.
          </p>
        </div>
        <div>
          <div className="text-[14px] font-semibold">Why only context</div>
          <p className="m-0 mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Those references come from paper tests with more targets. With fixed cut-offs, false positives rise when fewer targets are found, especially for the Centre of Cancellation
            (J Int Neuropsychol Soc, 2020). Watch Purna's numbers change over time rather than against a line.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
