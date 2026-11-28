import { useId } from "react";
import { cn } from "@/lib/utils";

/** The diya mark. The flame lights once when the page opens, then sways gently (styles.css: .diya-mark); still with reduced motion. */
export function DiyaMark({ className, animated = true }: { className?: string; animated?: boolean }) {
  const glow = "dm" + useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={cn("size-6 overflow-visible", animated && "diya-mark", className)}>
      <defs>
        <radialGradient id={glow}>
          <stop offset="0" stopColor="#F59E0B" stopOpacity=".55" />
          <stop offset="1" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle className="dm-glow" cx="32" cy="22" r="22" fill={`url(#${glow})`} />
      <g className="dm-flame">
        <path d="M32 6c5 9 9 14 9 20a9 9 0 0 1-18 0c0-6 4-11 9-20z" fill="#F59E0B" />
        <path className="dm-core" d="M32 16c2.4 4.6 4 7.4 4 10.4a4 4 0 0 1-8 0c0-3 1.6-5.8 4-10.4z" fill="#FFE7A8" />
      </g>
      <path d="M6 38h52c-3 11-13 18-26 18S9 49 6 38z" fill="#C2410C" />
      <path d="M50 38h9l-3 3h-7z" fill="#C2410C" />
    </svg>
  );
}

export function Logo({ className, deva = true, tone = "default" }: { className?: string; deva?: boolean; tone?: "default" | "light" }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <DiyaMark />
      <span className={cn("text-[19px] font-semibold tracking-[-0.02em]", tone === "light" ? "text-night-foreground" : "text-foreground")}>Purna</span>
      {deva && <span lang="hi" className={cn("font-deva text-[17px]", tone === "light" ? "text-night-muted" : "text-muted-foreground")}>पूर्ण</span>}
    </span>
  );
}
