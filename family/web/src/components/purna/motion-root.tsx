// Wraps a page so its `m.*` components animate once motion's features arrive. Until then they render in place,
// still and readable, which is also what reduced motion shows.
import { LazyMotion } from "motion/react";
import type { ReactNode } from "react";

const load = () => import("@/lib/motion-features").then((r) => r.default);

export function MotionRoot({ children }: { children: ReactNode }) {
  return <LazyMotion features={load} strict>{children}</LazyMotion>;
}
