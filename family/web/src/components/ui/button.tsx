import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-[15px] font-medium transition-[background,color,box-shadow,transform] outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_1px_2px_rgba(0,0,0,0.2)] hover:bg-primary/88",
        outline: "border border-input bg-card text-foreground shadow-[0_1px_2px_rgba(23,20,15,0.05)] hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        flame: "bg-flame text-night shadow-[0_8px_24px_-8px_rgba(245,158,11,0.6)] hover:brightness-105",
        night: "border border-white/15 bg-white/5 text-night-foreground hover:bg-white/10",
        destructive: "bg-danger text-white hover:bg-danger/90 dark:text-[#2a1212]",
        "destructive-outline": "border border-danger/40 bg-card text-danger hover:bg-danger-bg",
        link: "h-auto px-0 text-link underline underline-offset-4 hover:opacity-80",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
});
Button.displayName = "Button";
export { buttonVariants };
