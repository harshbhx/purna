// Timeline in the style of Aceternity UI: steps down a rail, with a beam that fills as you scroll.
import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useRef, type ReactNode } from "react";

export interface TimelineEntry { title: string; icon: ReactNode; content: ReactNode }

export function Timeline({ data }: { data: TimelineEntry[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  return (
    <ol ref={ref} className="relative mx-auto flex max-w-3xl flex-col gap-10 md:gap-14">
      <div aria-hidden="true" className="absolute top-2 bottom-2 left-[19px] w-px bg-border md:left-[23px]">
        <motion.div style={{ height: reduce ? "100%" : height }} className="w-px bg-gradient-to-b from-flame via-side-l to-transparent" />
      </div>
      {data.map((d, i) => (
        <li key={d.title} className="relative grid grid-cols-[40px_1fr] gap-5 md:grid-cols-[48px_1fr] md:gap-8">
          <span className="relative z-10 flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm md:size-12 [&_svg]:size-[18px]">
            {d.icon}
          </span>
          <div className="pt-1.5 md:pt-2.5">
            <p className="text-[13px] font-medium text-muted-foreground">Step {i + 1}</p>
            <h3 className="mt-1 text-xl font-semibold tracking-[-0.015em] md:text-2xl">{d.title}</h3>
            <div className="mt-2 text-[16px] leading-relaxed text-muted-foreground">{d.content}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
