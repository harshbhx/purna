import { cn } from "@/lib/utils";

export function DiyaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={cn("size-6", className)}>
      <path d="M32 6c5 9 9 14 9 20a9 9 0 0 1-18 0c0-6 4-11 9-20z" fill="#F59E0B" />
      <path d="M6 38h52c-3 11-13 18-26 18S9 49 6 38z" fill="#C2410C" />
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
