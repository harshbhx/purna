// Dot grid background in the style of Aceternity UI, faded toward the edges.
import { cn } from "@/lib/utils";

export function DotBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_72%)]",
        className,
      )}
    />
  );
}
