# Contributing to Purna

Thanks for helping. Purna is a hackathon project for a medical setting, so two things matter more than speed: **honesty about what's proven**, and **not breaking what families rely on**.

## Before you start

- Read [`AGENTS.md`](AGENTS.md) (the rules for anyone, human or agent, changing this repo) and [`docs/00-RUNBOOK.md`](docs/00-RUNBOOK.md).
- Open an issue first (bug, idea or accessibility problem) so we can agree on the change. Templates are under **New issue**.
- Found a security problem? Don't open an issue: see [SECURITY.md](SECURITY.md).

## Set up and test

```bash
cd tools && npm ci && npm run typecheck && npm test                 # the engine, the patient bench, sounds
cd family && npm ci && npm run typecheck && npm test                # Worker + local D1
npm run test:web && npm run build && npm run test:e2e               # web app, then real Chrome
```

Everything must be green before a pull request. CI runs the same, and also fails if the bench chart (`cd tools && npm run chart`) or the demo sessions (`cd family && npm run sample`) are stale.

## Rules that keep Purna safe

1. **Core stays portable.** `Assets/Scripts/Core` has no Lens Studio globals, no DOM, no Node APIs. The Lens, Node and the browser all run it.
2. **The session contract moves together.** Changing `purna.session.v1` means changing Core, `family/src/lib/validate.ts` and `docs/03-ARCHITECTURE.md` in the same pull request.
3. **No medical claims.** Purna says "practice", never "treatment" or "therapy", and every result says "Practice result, not a diagnosis". Label what you've checked: "logic proven" (tests or the preview) or "feel unproven" (only real people can tell).
4. **Nothing flashes.** Nothing in the Lens or on the site may change brightness more than three times a second.
5. **Privacy by default.** No analytics, no third-party scripts, no new personal data without a reason written in the privacy page.
6. **Accessible or it doesn't merge.** New screens get an axe scan in `e2e/a11y.spec.ts` in light and dark.

## Pull requests

One self-contained change per commit, grouped sensibly, with a clear message. Link the issue (`Closes #12`). The template asks the few questions that matter.

By contributing you agree your work is released under the [MIT licence](LICENSE), and to follow the [code of conduct](CODE_OF_CONDUCT.md).
