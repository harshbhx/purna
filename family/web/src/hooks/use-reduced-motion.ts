// Reads prefers-reduced-motion on every mount and follows changes. (motion's own hook caches the first answer.)
import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";
const read = () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(QUERY).matches;

export function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(read);
  useEffect(() => {
    const mq = window.matchMedia?.(QUERY);
    if (!mq) return;
    const on = () => setReduce(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduce;
}
