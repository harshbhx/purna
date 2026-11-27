import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    data-slot="input"
    className={cn(
      "flex h-11 w-full min-w-0 rounded-lg border border-input bg-card px-3.5 text-base text-foreground shadow-[0_1px_2px_rgba(23,20,15,0.04)] transition-[border,box-shadow] outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15 aria-invalid:border-danger aria-invalid:ring-danger/15 disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
