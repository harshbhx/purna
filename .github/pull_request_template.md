## What this changes

<!-- One or two sentences. -->

Closes #

## How it was checked

- [ ] `cd tools && npm run typecheck && npm test` (Core coverage ≥ 85%)
- [ ] `cd family && npm run typecheck && npm test && npm run test:web && npm run build && npm run test:e2e`
- [ ] Lens changes: LEAF scenarios run in the Lens Studio preview (list which pass)
- [ ] Screenshots or a GIF for anything visual
- [ ] New screens have an axe scan in light and dark; nothing changes brightness more than three times a second
- [ ] If the session JSON changed: Core, `family/src/lib/validate.ts` and `docs/03-ARCHITECTURE.md` changed together

## Honesty check

- [ ] No medical claims; anything only seen in the preview is labelled "logic proven" or "feel unproven"
- [ ] No codes, links, keys, account IDs or health details in the diff or this description
