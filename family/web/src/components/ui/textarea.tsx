import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    data-slot="textarea"
    className={cn(
      "flex min-h-28 w-full rounded-lg border border-input bg-card px-3.5 py-3 text-[15px] text-foreground shadow-[0_1px_2px_rgba(23,20,15,0.04)] outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
