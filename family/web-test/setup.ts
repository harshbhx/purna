// jsdom lacks a few browser APIs that motion and the charts use.
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());

let reduce = false;
export function setReducedMotion(on: boolean) { reduce = on; }

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? reduce : false,
    media: query, onchange: null,
    addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; },
  }),
});
class IO { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } root = null; rootMargin = ""; thresholds = []; }
class RO { observe() {} unobserve() {} disconnect() {} }
Object.assign(globalThis, { IntersectionObserver: IO, ResizeObserver: RO });
window.scrollTo = () => {};
// Canvas-based effects (ShinyText) simply skip drawing in jsdom.
HTMLCanvasElement.prototype.getContext = (() => null) as unknown as HTMLCanvasElement["getContext"];
