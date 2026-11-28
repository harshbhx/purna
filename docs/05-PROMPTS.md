# 05 — Prompts

Copy-paste prompts, in order. Start every CLAD prompt in a **fresh chat** (`/clear`) in the Lens project folder, with Lens Studio open and `/mcp` showing `lens-studio` connected.

---

## 1. CLAD: the official first build (from plan-lens)

> Read devpost/design-brief.md and build it for SPECS. Follow the brief closely. Get the basic flow working first, then add detail. Write and run LEAF tests for each done criterion, and tell me which pass.

If that run tries to do everything at once and stalls, `/clear` and drive it slice by slice with §2.

## 2. CLAD: slice prompts

Every slice prompt starts with this line:

> Read devpost/design-brief.md and docs/03-ARCHITECTURE.md §2–§4. The logic in Assets/Scripts/Core already exists and is tested; use PurnaEngine and don't reimplement any of it.

**Slice 1 — table, diyas, pinch (T20, C1–C2)**
> Build slice 1 only. Remove SIKExamples. Add `PreviewTable (stand-in)` exactly as specified. Create the Diya prefab (whole, chipped-left, chipped-right variants; flame child disabled; collider the size of the diya; SIK Interactable; DiyaView script). Create PurnaController with inputs `seed`, `autoStart`, `yawOverrideDeg` (NaN = off), `fastHints`, and a public `getState()`. On start, call `engine.start(getTime())`, build the field from `engine.items("near")` in field-relative coordinates (03-ARCHITECTURE §2), make every diya pinchable both by touch and with SIK's ray from a resting hand (no reaching across the body), and on a SIK trigger call `engine.pinch(...)` and light / tick / ignore per the result, playing `Assets/Audio/light.wav` or `tick.wav` from a spatial AudioComponent on the diya (don't generate new sounds; use these files). Then write LEAF scenarios c1 and c2 from docs/06-TESTING.md §3, run them in the preview, and report which pass.

**Slice 2 — hints and beam (T22, T23, C3)**
> Build slice 2 only. Add Beam (BeamView: setLevel 0–3 with the opacities in docs/02-DESIGN.md §3, pulse(n), sweep(seconds)) and HintSpeaker (spatial AudioComponent at the table's left edge playing `Assets/Audio/bell.wav`). In PurnaController's update, compute yaw from the camera (or the override), call `engine.tick(getTime(), yaw)`, set the beam level, and react to `frame.cue` ("hint1" → bell + pulse twice, "hint2" → sweep 3 s). Check that turning left in the preview gives a positive yaw. Write LEAF c3 from docs/06-TESTING.md §3 using `fastHints` and the yaw override, run it, report.

**Slice 3 — replay (T24, C4)**
> Build slice 3 only. Add ReplayView: when the engine phase becomes "replay", draw a glowing thread through `engine.replay().order` (positions from the near items), 0.4 s per segment, and pulse every id in `missed` per docs/02-DESIGN.md §5. Add a Replay button hook that replays it. Write LEAF c4, run it, report.

**Slice 4 — report, Logger, send (T25, T26, C5)**
> Build slice 4 only. Add ReportCard (UI Kit) laid out as docs/02-DESIGN.md §8 with the strings in docs/01-PRD.md §9, filled from `engine.report(...)`. Print `logLine(json)` to the Logger. Add FamilySender using InternetModule fetch: POST `{ deviceId, session }` to the endpoint input (default `https://purna.dualmindlab.tech/api/v1/sessions`), 8 s timeout, show "Sent to family ✓" or the pairing code; on any failure show "Couldn't send. Saved to the Logger." Only show Send to family when settings.share is on. Write LEAF c5 (with the endpoint pointed at an unreachable URL to test the fallback), run it, report.

**Setup panel (T21)**
> Build the SetupPanel with UI Kit per docs/02-DESIGN.md §7, 50 cm ahead and just above the table. Show "Sit down, with someone nearby. Stop if you feel dizzy, sick or unwell." above Start. Each control sets the matching field of the engine settings; Start creates the PurnaEngine with those settings and hides the panel. Keep `autoStart` working for tests. Keep the last 3 sessions' `briefOf(report)` (Assets/Scripts/Core/Next.ts) in persistent storage; on open, preselect Difficulty and Hint delay with `suggestNext(briefs)` and show its `reason` under them. Don't write your own rules.

**Self-test and demo director (T27, T28)**
> Add Assets/Scripts/Debug/PurnaSelfTest.ts (off by default, never referenced by PurnaController): it drives PurnaController through c1–c5 with the yaw override and prints `PASS c1 …` / `FAIL c1 …` lines. Then add PurnaDemoDirector (off by default): a fixed-timestep timeline that plays the main video take (light four right-side diyas, stall 7 s, hint 1, turn the head left 25° over 1.5 s, light the left diyas, pinch one chipped-on-left diya, finish, replay, report, send) and prints `[Demo] mark <name> frame=<n>` at each beat.

**Add-ons (T35, T36) — only after the cut-line check passes**
> Build the Drift warm-up per docs/01-PRD.md L13 using `engine.tick(...).drift`. The diya to pinch glows softly at 1 Hz (smooth, never fully off); nothing may change brightness more than three times a second. Write LEAF a1 (no drift diya ever moves right; pinching during a flicker counts as a hit). Run, report.

> Add "Look to light" (setup toggle, off by default) per devpost/design-brief.md: holding the head on a diya for 1.5 s fills a ring and then calls `engine.pinch(...)` exactly as a pinch would; chipped diyas still only tick. Write a LEAF scenario with the yaw override aimed at one whole and one chipped diya. Run, report.

> Build the far board per docs/01-PRD.md L14: `PreviewBoard (stand-in)`, far pinch with SIK's ray, its own numbers on the report's Left vs right tile. Write LEAF a2, run, report.

## 3. Design-change round (T29, T30)

Write `devpost/design-changes-N.md` in design words, then:

> Read devpost/design-changes-N.md and apply it in order. After each part, check the preview, re-run all LEAF tests, and fix anything that broke. Append a "Round N changes" section to devpost/design-brief.md listing what changed. Don't remove done criteria.

Template for the notes file:
```
# Purna: design changes, round N
Source: Harsh walked the build in Interactive Preview on <date>.
## Fixes (do first)
1. <what's wrong> → <what it should be, with cm / seconds>
## Look and feel
2. ...
## Keep working
All done criteria and LEAF tests must keep passing.
```

## 4. Coding agent: core logic (T10–T18)

> Read AGENTS.md, docs/03-ARCHITECTURE.md §2, §3 and §5, docs/01-PRD.md L2–L14 and docs/06-TESTING.md §1–§2. Implement issue #<n> in Assets/Scripts/Core with tests in tools/test. Pure TypeScript only (no Lens Studio globals, no Node APIs in Core). Run `cd tools && npx vitest run --coverage`; all green and core coverage ≥ 85%. Open a PR that says "Closes #<n>".

## 5. Coding agent: Purna Family (T40–T50)

> Read AGENTS.md, docs/03-ARCHITECTURE.md §5–§6, docs/01-PRD.md §7 and §9, docs/02-DESIGN.md §9 and docs/06-TESTING.md §4. Implement issue #<n> in family/. React + Vite + Tailwind for the web app (rules in AGENTS.md §3), TypeScript for the Worker, no third-party scripts at runtime. Run `cd family && npm run typecheck && npm test && npm run test:web && npm run build && npm run test:e2e`. Open a PR that says "Closes #<n>".

## 6. Emergencies

- **CLAD loses the plot / context is full:** `/clear`, then: "Read devpost/design-brief.md and docs/04-TASKS.md. The current slice is <Tnn>. Check the scene and scripts for what exists, list what's missing for this slice only, then finish it and run its LEAF test."
- **LEAF can't turn the camera:** "Use PurnaController.yawOverrideDeg in every scenario that needs a head turn. Don't move the preview camera from tests."
- **Fetch fails in the preview:** "Set the Preview's Device Type Override to Spectacles and add the Internet Module to the project. If it still fails, keep the Logger fallback and continue."
- **Lens Studio login blocked:** install 5.23.2 from ar.snap.com/download/v5-23-2 (the hackathon resources page recommends it when 5.22+ sign-in is blocked).
- **Running out of time:** apply the cut line in 04-TASKS.md; ship C1–C5 only.
