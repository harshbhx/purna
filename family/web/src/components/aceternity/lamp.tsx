// Lamp effect in the style of Aceternity UI's "Lamp": two conic beams open from a glowing line.
// For Purna it is literally a lamp: the closing band where a family types their code.
import { m } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function LampContainer({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const open = { width: "30rem" };
  const from = reduce ? open : { width: "15rem", opacity: 0.5 };
  const t = { delay: 0.2, duration: 0.9, ease: "easeInOut" as const };
  return (
    <div className={cn("relative isolate flex w-full flex-col items-center overflow-hidden bg-night pt-40 pb-20", className)}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 flex h-[22rem] scale-y-125 items-center justify-center">
        <m.div
          initial={from}
          whileInView={{ ...open, opacity: 1 }}
          viewport={{ once: true }}
          transition={t}
          style={{ backgroundImage: "conic-gradient(from 70deg at center top, #f59e0b, transparent, transparent)" }}
          className="absolute right-1/2 h-56 w-[30rem] overflow-visible"
        >
          <div className="absolute bottom-0 left-0 z-20 h-40 w-full bg-night [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute bottom-0 left-0 z-20 h-full w-40 bg-night [mask-image:linear-gradient(to_right,white,transparent)]" />
        </m.div>
        <m.div
          initial={from}
          whileInView={{ ...open, opacity: 1 }}
          viewport={{ once: true }}
          transition={t}
          style={{ backgroundImage: "conic-gradient(from 290deg at center top, transparent, transparent, #f59e0b)" }}
          className="absolute left-1/2 h-56 w-[30rem]"
        >
          <div className="absolute right-0 bottom-0 z-20 h-full w-40 bg-night [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute right-0 bottom-0 z-20 h-40 w-full bg-night [mask-image:linear-gradient(to_top,white,transparent)]" />
        </m.div>
        <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-night blur-2xl" />
        <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md" />
        <div className="absolute z-50 h-36 w-[28rem] -translate-y-1/2 rounded-full bg-flame opacity-40 blur-3xl" />
        <m.div
          initial={reduce ? { width: "16rem" } : { width: "8rem" }}
          whileInView={{ width: "16rem" }}
          viewport={{ once: true }}
          transition={t}
          className="absolute z-30 h-36 -translate-y-[6rem] rounded-full bg-amber-300 blur-2xl"
        />
        <m.div
          initial={reduce ? open : { width: "15rem" }}
          whileInView={open}
          viewport={{ once: true }}
          transition={t}
          className="absolute z-50 h-0.5 w-[30rem] -translate-y-[7rem] bg-amber-300"
        />
        <div className="absolute z-40 h-44 w-full -translate-y-[12.5rem] bg-night" />
      </div>
      <div className="relative z-50 w-full px-5">{children}</div>
    </div>
  );
}
