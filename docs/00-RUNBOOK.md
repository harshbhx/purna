# 00 — Runbook (now → submission)

All times IST. **Hard deadline: Tue 8 Dec 03:30** (Mon 7 Dec 17:00 ET). Our target: **submitted by Mon 7 Dec 22:00**. Live review: **Thu 3 Dec 22:30**.

**Who does what**
- **Claude (cloud):** all docs, all core logic + tests, all of Purna Family (Worker, D1, web app) + tests, README, Devpost text. Pushes through issue → PR → merge commit, as Harsh (author and committer).
- **Laptop agent (Claude Code + CLAD, on Harsh's laptop):** Lens Studio work only, from `LAPTOP-PROMPT.md` and `docs/05-PROMPTS.md`. Deploys Purna Family with Harsh's Cloudflare account.
- **Harsh:** logins, approving the brief, walking the Lens in the preview, design notes, GIFs, video voice, final submit.

Other commitments in this window: 404 Hackathon (Sun 29 Nov 17:17 → Mon 30 Nov 17:17), Kavach (2 Dec), X Marks (Reddit, freeze Tue 8 Dec 22:00), Sem 3 prep. Kiroween is dropped.

---

## Phase 0 — setup (Sat 28 – Sun 29 Nov, before 17:00)
1. Harsh reads `devpost/design-brief.md`, says "looks good" → Claude sets `status: approved`.
2. Laptop agent: `LAPTOP-PROMPT.md` (Lens Studio 5.23.2, project, CLAD, skill pack, repo, D1). **[Harsh]** logins.
3. **Gate 0:** the empty SPECS project runs in the preview; `/mcp` shows lens-studio; repo exists with the pack; core tests green in CI.

## Phase 1 — logic + family (Claude, Sat 28 Nov – Tue 1 Dec)
- T10–T18 core with tests; T40–T50 Purna Family with tests.
- **Gate 1 (Tue 1 Dec):** core coverage ≥ 85%, patient bench green; Purna Family deployed at purna.dualmindlab.tech with a test session posted by curl.

## Phase 2 — the Lens (laptop agent + CLAD, Tue 1 – Fri 4 Dec)
| Day | Slices | Harsh |
|---|---|---|
| Tue 1 | T20 slice 1, T21 setup panel | 15 min: click through |
| Wed 2 | T22–T23 slice 2 (Kavach day: agent works alone) | 10 min |
| Thu 3 | T24 slice 3, T25–T26 slice 4 | **22:30 live review** with whatever works |
| Fri 4 | T27 self-test, T28 demo director, T29 design round 1 | 1 h walk + design notes |
- **Gate 2 / cut line (Fri 4, 21:00):** C1–C5 pass in LEAF. If not, add-ons are cut.

## Phase 3 — add-ons and polish (Sat 5 – Sun 6 Dec)
- Sat 5: T35 Drift, T36 far board (only if Gate 2 passed); T30 design round 2; judge simulation #1.
- Sun 6: T61 GIFs (Harsh, 45 min), T60 README (Claude), demo takes with the director.

## Phase 4 — ship (Mon 7 Dec; Purna has priority)
- Morning: T62 video (Harsh records voice; ≤ 2:50; no copyrighted music). Upload to YouTube, public.
- Afternoon: judge simulation #2, T63 Devpost text with final numbers, T64 checklist.
- **22:00: submit.** After that, only true emergencies before 03:30.

## Gates
| Gate | When | Pass | If it fails |
|---|---|---|---|
| G0 | Sun 29, 17:00 | Project runs; MCP connected; repo + CI | Fix setup before anything |
| G1 | Tue 1 | Core + bench green; Family deployed | Lens slices still start; Family can wait until Thu |
| G2 | Fri 4, 21:00 | C1–C5 pass in LEAF | Cut add-ons; polish C1–C5 |
| G3 | Mon 7, 18:00 | Video uploaded; README final | Submit with known issues listed honestly |

## Minimum shippable Purna
Table + pinch + hints + replay + report + Logger JSON. That alone scores on all four criteria. Purna Family and add-ons make it win, but never block submission.
