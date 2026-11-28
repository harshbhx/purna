# Third-party code and fonts in Purna Family

| What | Where | Licence |
|---|---|---|
| [React Bits](https://reactbits.dev) components: BlurText, CountUp, Magnet, ShinyText, SpotlightCard, by David Haz | `web/src/components/reactbits/` (copied unchanged apart from a header; BlurText also swaps `motion.span` for `m.span` so motion can load lazily) | MIT with the Commons Clause (free to use in projects; the components themselves may not be sold) |
| Component patterns from [shadcn/ui](https://ui.shadcn.com) (button, input, label, textarea, badge, card, alert, dialog, table, collapsible), written for Purna's tokens | `web/src/components/ui/` | MIT |
| Effects in the style of [Aceternity UI](https://ui.aceternity.com) (lamp, spotlight, timeline, dot background), written for Purna | `web/src/components/aceternity/` | Original code; the visual ideas are credited to Aceternity UI |
| [Radix UI](https://www.radix-ui.com) primitives, [motion](https://motion.dev), [lucide](https://lucide.dev) icons | npm dependencies | MIT / ISC |
| Geist font by Vercel, via `@fontsource-variable/geist` | bundled by Vite | SIL Open Font License 1.1 |
| Mukta font by Ek Type | `web/public/fonts/` | SIL Open Font License 1.1 (`web/public/fonts/OFL.txt`) |
