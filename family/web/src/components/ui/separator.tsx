import { cn } from "@/lib/utils";
export function Separator({ className }: { className?: string }) {
  return <div role="separator" aria-hidden="true" className={cn("h-px w-full bg-border", className)} />;
}
