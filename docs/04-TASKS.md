# 04 — Tasks

Owner: **H** = Harsh (needs you) · **C** = CLAD in Lens Studio on the laptop · **A** = coding agent (cloud or laptop).
Priority: **P0** ships or we don't submit · **P1** makes it win · **P2** only if time is left.
`tools/create-issues.sh` turns every `| Tnn |` row into a GitHub issue. Work one issue at a time (AGENTS.md rule 5).

**Status 28 Nov:** ✅ rows are done in the cloud (Core 46 tests, Family 36 tests + browser walk). `create-issues.sh` skips them; the import PR closes them together. T18's CI runs once the repo exists.

**Cut line:** if C1–C5 don't all pass in LEAF by **Fri 4 Dec 21:00 IST**, every P2 row is cut and T35/T36 wait.

## Phase 0 — setup (Harsh, before the 404 Hackathon starts Sun 29 Nov 17:17)

| ID | Title | Owner | Pri | Est | Acceptance |
|---|---|---|---|---|---|
| T01 | Register for Learn AR with SPECS on Devpost | H | P0 | 5 min | Registered on learn-specs.devpost.com |
| T02 | Install Lens Studio 5.23.2 and create the SPECS Base Template project | H | P0 | 30 min | `purna.esproj` saved; preview runs |
| T03 | Install CLAD and connect the Lens Studio MCP in Claude Code | H | P0 | 20 min | `/mcp` shows lens-studio connected; `/plugin` lists ls-clad |
| T04 | Create the GitHub repo and merge this pack into the Lens project folder | H | P0 | 20 min | Repo `harshbhx/purna` public; signed first commit; issues created |
| T05 | Install the skill pack and run plan-lens setup check in the project | H | P0 | 10 min | plan-lens confirms the setup; brief approved (`status: approved`) |
| T06 | Create the D1 database and custom domain for Purna Family | H | P0 | 15 min | `wrangler d1 create purna` done; id in `family/wrangler.toml`; DNS ready |

## Phase 1 — core logic (agent; Footlight pattern, before CLAD)

| ID | Title | Owner | Pri | Est | Acceptance |
|---|---|---|---|---|---|
| T10 | ✅ Core types, fields, presets and seeded RNG | A | P0 | 1 h | `PurnaTypes.ts`, `Rng.ts` per 03-ARCHITECTURE §3; compile in Node |
| T11 | ✅ Layout generator | A | P0 | 2 h | Seeds 1–500 × 3 presets: exact side/chip balance, min gap, margin, empty centre band, deterministic |
| T12 | ✅ Cue engine and beam fading | A | P0 | 2 h | Unit tests for every rule in 01-PRD L4–L6 |
| T13 | ✅ Path metrics (pearson, crossings) | A | P0 | 1 h | Hand-worked cases pass |
| T14 | ✅ Field results, head stats and session JSON | A | P0 | 2 h | Matches 03-ARCHITECTURE §5 exactly; summary sentence |
| T15 | ✅ PurnaEngine facade | A | P0 | 2 h | Scripted session → valid `purna.session.v1`; phases advance correctly |
| T16 | ✅ Drift plan (leftward only) | A | P1 | 1 h | Every spawn moves toward −x; flicker windows don't overlap |
| T17 | ✅ Patient bench (3 simulated players) | A | P1 | 2 h | Scores separate healthy / left neglect / object neglect on seeds 1–200 |
| T18 | ✅ CI workflow for core + family tests with coverage | A | P0 | 30 min | Green on PR; core coverage ≥ 85% |

## Phase 2 — the Lens (CLAD, slice by slice; prompts in 05-PROMPTS)

| ID | Title | Owner | Pri | Est | Acceptance |
|---|---|---|---|---|---|
| T20 | Slice 1: stand-in table, diyas, pinch (C1, C2) | C | P0 | 1.5 h | LEAF c1, c2 pass |
| T21 | Setup panel | C | P0 | 1 h | All controls change engine settings; Start hides it |
| T22 | Slice 2: hints, bell, beam pulse/sweep/fading (C3) | C | P0 | 1.5 h | LEAF c3 passes with yaw override + fast hints |
| T23 | Head yaw from camera + override + sign check | C | P0 | 30 min | Turning left in preview gives positive yaw; override works |
| T24 | Slice 3: replay thread and missed pulses (C4) | C | P0 | 1.5 h | LEAF c4 passes |
| T25 | Slice 4: report card, Logger line (C5 part 1) | C | P0 | 1.5 h | Tiles match engine JSON; `PURNA_SESSION` line printed |
| T26 | Send to family + pairing code + offline fallback (C5 part 2) | C | P0 | 1 h | Posts with Device Type Override; shows code; failure path tested with a bad URL |
| T27 | PurnaSelfTest (PASS/FAIL per criterion) | C | P1 | 45 min | Prints 5 PASS lines in preview |
| T28 | PurnaDemoDirector (scripted session for recording) | C | P1 | 1 h | Plays the video's main take hands-free |
| T29 | Design round 1 (Harsh walks it, writes design notes) | H | P0 | 1 h | `devpost/design-changes-1.md` written and applied; LEAF still green |
| T30 | Design round 2 | H | P1 | 45 min | `devpost/design-changes-2.md` applied |
| T35 | Drift warm-up (add-on) | C | P2 | 1.5 h | LEAF a1: no drift diya moves right; flicker pinch counts |
| T36 | Far board (add-on) | C | P2 | 2 h | LEAF a2: far numbers separate on the report |

## Phase 3 — Purna Family (agent)

| ID | Title | Owner | Pri | Est | Acceptance |
|---|---|---|---|---|---|
| T40 | ✅ Worker skeleton, wrangler config, D1 migration, health route | A | P0 | 1 h | `wrangler dev` serves `/` and `/api/v1/health` |
| T41 | ✅ POST /sessions with validation + pairing code | A | P0 | 2 h | Tests: valid, malformed, oversized, unknown device gets code |
| T42 | ✅ POST /pair, family key, invite link | A | P0 | 1.5 h | Tests: pair, expired code, already paired, past sessions linked |
| T43 | ✅ GET /me, session detail, import | A | P0 | 1.5 h | Tests incl. auth failures |
| T44 | ✅ Doctor shares, doctor view API, notes | A | P0 | 1.5 h | Tests: create, expire, revoke, notes length |
| T45 | ✅ DELETE /me (delete everything) | A | P0 | 45 min | Test: every table empty for that patient |
| T46 | ✅ Web: home hero + pair form | A | P0 | 1.5 h | 360 px and 1440 px; keyboard; contrast |
| T47 | ✅ Web: dashboard cards, nudge, trend chart, notes | A | P0 | 2 h | Renders sample data; no console errors |
| T48 | ✅ Web: session detail with 2D replay | A | P1 | 1.5 h | Thread order matches `events`; reduced motion respected |
| T49 | ✅ Web: doctor view, CSV, print | A | P0 | 1.5 h | CSV opens in Sheets; print fits A4 |
| T50 | ✅ Web: invite, import, delete-everything flows | A | P0 | 1 h | Each flow works end to end on the deployed site |
| T51 | Deploy to purna.dualmindlab.tech + smoke test | H | P0 | 30 min | `curl /api/v1/health` ok; real Lens POST appears on the dashboard |

## Phase 4 — submission (Harsh + agent)

| ID | Title | Owner | Pri | Est | Acceptance |
|---|---|---|---|---|---|
| T60 | README with "For judges" table, GIFs, badges, research links | A | P0 | 2 h | Matches 07-SUBMISSION §3 |
| T61 | Record GIFs in the preview (stuck → hint → turn; replay; family card) | H | P0 | 45 min | 3 GIFs under 5 MB each in `docs/img/` |
| T62 | Demo video (≤ 2:50), public on YouTube | H | P0 | 4 h | Follows 07-SUBMISSION §1; no copyrighted music |
| T63 | Devpost text, built-with tags, disclosures | A | P0 | 1 h | 07-SUBMISSION §2 and §4 filled with real numbers |
| T64 | Final checks and submit | H | P0 | 1 h | 07-SUBMISSION §5 all ticked; submitted before Mon 7 Dec 22:00 IST |
