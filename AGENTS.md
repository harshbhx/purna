# AGENTS.md: rules for any coding agent in this repo

Purna is a SPECS Lens (stroke left-neglect practice) plus **Purna Family** (Cloudflare Worker + D1 + web app). Read `docs/00-RUNBOOK.md` first, then the doc for your task.

## Where things are
- `Assets/Scripts/Core/`: pure TypeScript logic (layout, hints, metrics, report). **Done and tested. CLAD must use `PurnaEngine` and never reimplement it.**
- `Assets/Scripts/*.ts` (outside Core): Lens components, built by CLAD in Lens Studio (`docs/05-PROMPTS.md`).
- `tools/`: vitest for Core + the patient bench. `family/`: the Worker, migrations, web app, tests.
- `devpost/design-brief.md`: the plan-lens brief CLAD builds from. `docs/`: PRD, design, architecture, tasks, testing, research.

## Rules
1. Core stays portable: no Lens globals, no DOM, no Node APIs, no `structuredClone`/`Array.prototype.at`/`Object.hasOwn`. Units: cm, seconds, degrees.
2. Before any PR, all green: `cd tools && npm run typecheck && npm test` (Core ≥ 85% lines) and `cd family && npm run typecheck && npm test && npm run test:web && npm run build && npm run test:e2e`. CI runs the same, plus checks that `docs/img/bench.svg` and the demo sessions are regenerated (`npm run chart`, `npm run sample`).
3. Web app: React + Vite + Tailwind in `family/web`, shadcn/ui components in `components/ui`, React Bits in `components/reactbits` (copied unchanged except `m.*` for `motion.*`, so motion loads lazily inside `MotionRoot`; use `m.*` in new components too), Aceternity-style effects in `components/aceternity`. No third-party scripts at runtime; CSP keeps `script-src 'self'`. Never `dangerouslySetInnerHTML`. Respect `prefers-reduced-motion` with `@/hooks/use-reduced-motion`. Credit new third-party code in `family/THIRD_PARTY.md`.
4. Session JSON is `purna.session.v1` (`docs/03-ARCHITECTURE.md` §5). Changing it means changing Core, the validator in `family/src/lib/validate.ts`, and the docs together.
5. Git: every change goes issue → branch → PR → merge (merge commit, so grouped commits stay readable); no PR left open; delete the branch after merging. One commit per self-contained change. Author **and committer** are `Harsh Bhanushali <bhanushaliharsh434@gmail.com>`; never Claude or a bot, no AI co-author lines. Sign with Harsh's key when you have it (laptop); otherwise commit unsigned. No Dependabot.
6. Never commit `.env`, `.dev.vars`, API tokens or account IDs. Never put secrets in Notion or the Devpost page.
7. Honest labels: anything only checked in the preview is "logic proven" or "feel unproven"; the patient bench uses simulated players, not patients. Purna is a practice tool, not a medical device.
