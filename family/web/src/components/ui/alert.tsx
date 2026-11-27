import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const alertVariants = cva("flex items-start gap-3 rounded-xl px-4 py-3 text-[15px] leading-relaxed [&>svg]:mt-0.5 [&>svg]:size-[18px] [&>svg]:shrink-0", {
  variants: {
    variant: {
      default: "bg-muted text-foreground",
      success: "bg-success-bg text-success",
      warn: "bg-warn-bg text-warn",
      danger: "bg-danger-bg text-danger",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Alert({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>) {
  const role = variant === "danger" ? "alert" : "status";
  return <div data-slot="alert" role={role} className={cn(alertVariants({ variant }), className)} {...props} />;
}
