# 06 — Testing

Three layers: **vitest** proves the logic, **LEAF** proves the Lens in the preview, **people** prove the feel. Label every claim "logic proven" or "feel unproven".

---

## 1. Core unit tests (`tools/test`, vitest)

Run: `cd tools && npm ci && npx vitest run --coverage`. Gate: all green, core line coverage ≥ 85%.

| File | Tests |
|---|---|
| `layout.test.ts` | For seeds 1–500 × each preset: whole count per side exact; chipped per side exact; chip sides balanced within each side; every pair ≥ min gap; every item ≥ margin from edges; no item with \|x\| < band; same seed → identical layout; different seeds → different layouts |
| `cue.test.ts` | No hint before `delay`; hint1 exactly once at `delay`; hint2 exactly once at `2·delay`; nothing after hint2 until a lit diya; lighting a diya resets the spell; no hint when `darkLeftWhole = 0`; chipped pinches don't reset; beam −1 after 4 un-hinted left finds; +1 on hint1; clamp 0–3; hint1 with beam at 0 still reports a pulse |
| `path.test.ts` | pearson of a line = ±1, of constants = 0; crossing square diagonals = 1; touching endpoints = 0; zig-zag example = known count |
| `metrics.test.ts` | All lit → CoC ≈ 0, egoAsym 0; only right half lit → CoC > 0.3; known chipped pinches → fp counts; revisit counted once per repeat; timeByColumn on a hand-built event list |
| `engine.test.ts` | Scripted session: start → near (complete) → replay; timeout ends at 90 s; finish() ends early; settings drift/far add phases in order; report validates against the schema shape in 03-ARCHITECTURE §5; JSON size < 64 KB for Hard + far + drift |
| `drift.test.ts` | Every drift item's x strictly decreases over time (DRIFT_DIRECTION = −1); flicker windows don't overlap; pinch during flicker = drift-hit, else drift-miss |
| `report.test.ts` | Summary sentence for 0, 1 and several hints; `logLine` starts with `PURNA_SESSION ` and parses back |

## 2. Patient bench (`tools/test/bench.test.ts`) — simulated, not clinical

Three scripted players run the same engine on seeds 1–200 (Standard):

| Player | Behaviour |
|---|---|
| Healthy | Sweeps rows left → right, front to back; lights every whole diya; never pinches chipped; turns head toward each target |
| Left neglect | Never attends to items with x < −12 cm unless a hint fired in the last 3 s (then finds one, as patients do with cueing); random order on the right; head stays > −5° |
| Object neglect | Searches like Healthy but treats chipped-on-left diyas as whole (lights them) |

Left neglect details: never attends left of x = −12 cm unless a hint fired in the last 3 s, and even then not past −22 cm; head turns left at most 8° unless just cued.

Assertions (as implemented in `tools/test/bench.test.ts`):
- Healthy, every seed: finds everything; no chipped mistakes; no hints; |CoC| < 0.2; bestR > 0.6.
- Left neglect vs Healthy on the **same layout**, every seed: CoC ≥ Healthy's; less time turned left; at least one hint.
- Left neglect, across 200 seeds: misses at least one left diya in ≥ 95% (measured: 196/200); mean CoC shift > 0.15 (measured 0.198); mean egoAsym > 0.15 (measured 0.223).
- Object neglect, every seed: finds every whole diya; fpChipLeft ≥ 2; fpChipRight = 0; alloAsym ≥ 2; |CoC| < 0.2.

Honest note: with cueing, a mild left-neglect searcher sometimes finds every left diya (4 of 200 seeds). The head-turn and hint measures still separate it on every seed.

README wording: "On 200 simulated sessions per player, Purna's measures separated three scripted search styles: hint count and head turn on every seed, left misses on 196 of 200. These are simulated players, not patients."

## 3. LEAF scenarios (`Assets/Tests`, run in Lens Studio)

All use `PurnaController.seed = 4127`, `autoStart = true`, and the yaw override; c3 uses `fastHints` (delay 1 s). Read results through `getState()`. Run each at least 3 times before submission and record the results in the README.

| ID | Criterion | Steps | Asserts |
|---|---|---|---|
| c1 | Table sets up | Start (Standard) | 24 items; 6 whole + 6 chipped per side; chipped gaps 3 L + 3 R per side; all \|x\| ≥ 3; table centre (0, −30, −65) ± 0.5 cm; beam at x = −35 |
| c2 | Pinches | Pinch a whole, a chipped, the same whole again | litIds contains the whole; flame enabled; chipped not lit; log has `lit`, `chipped`, `revisit` with side and t |
| c3 | Hints | Light 2 right whole; wait 1.1 s → hint1; wait 1.1 s → hint2; light all left whole; wait 3 s | `hint1Count` 1 then `hint2Count` 1; bell AudioComponent played; no further hints after left complete |
| c4 | Replay | Light 5 diyas in a known order, finish | Replay segment count = 4; segment order matches; missed whole ids pulsing |
| c5 | Report + send | Finish; endpoint = `https://invalid.example/api` | Tiles show the engine's numbers; Logger contains one `PURNA_SESSION ` line that parses; "Couldn't send. Saved to the Logger." visible |
| a1 | Drift (add-on) | Run drift 5 s at fixed timestep | Every drift item's x decreases each frame; a pinch during a flicker counts |
| a2 | Far board (add-on) | Enable far; light 2 board diyas with far pinch | Report JSON `far` present; Left vs right tile shows Table and Board rows |

If LEAF can move the preview camera in this Lens Studio version, add one extra check to c3 that rotates the camera left and sees yaw > 0. Never depend on it.

## 4. Purna Family tests (`family/test`, vitest 4 + `@cloudflare/vitest-plugin`)

Status 28 Nov, all in CI:

| Suite | Command | Count |
|---|---|---|
| Core + patient bench + sounds | `cd tools && npm test` | 60 tests (47 Core and bench, 13 sounds), 98.9% Core lines |
| Worker + local D1 (API, validator, crypto, engine contract, rate limits) | `cd family && npm test` | 74 tests |
| React web app in jsdom (night table, replay, trend, app shell, therapist view, CSV, API client; the three-searcher explainer; every dashboard tool against a fake server) | `npm run test:web` | 38 tests |
| End-to-end, real Chrome vs the production build on `wrangler dev` (phone + desktop) | `npm run test:e2e` | 28 tests on 2 viewports: landing animation, reduced motion, no sideways scroll from 320 to 1440 px, phone menu, every family and doctor flow, stopping a doctor link, print layout, dead links, a keyboard-only walk, and axe WCAG 2.1 A/AA scans of every screen and dialog in light and dark (`e2e/a11y.spec.ts`) |

The **contract test** runs the real engine with the simulated players through every preset × far board × warm-up and checks each session passes the server's validator and fits in 64 KB, so the Lens and Purna Family can't drift apart.

API coverage:

| Area | Tests |
|---|---|
| Sessions | valid session → 201 + pairCode for unknown device; same device again → same code; linked device → `linked: true`; wrong schema → 400; > 64 KB → 413; non-finite number → 400; bad deviceId → 400 |
| Pairing | good code → familyKey + patient; past sessions linked; expired → 404; reused → 409; name trimmed and capped |
| Me | no/bad key → 401; cards newest first; detail returns full JSON; import works and validates |
| Shares | create → token works on /doctor; expired → 410; revoked → 410; days clamped 1–14; notes 1–1000 chars, appear in /me |
| Delete | DELETE /me with wrong confirm → 400; correct → 204, and every table has no rows for that patient |
| Static | `/api/unknown` 404 JSON (CSP checked in the browser walk below, since `_headers` is applied by the assets layer) |

**Browser walk (done 28 Nov, local `wrangler dev`, Chrome 390 px light/dark + 1280 px):** POST 9 demo sessions → pair with the code typed as `diya w6vu` → dashboard → session replay → share link → doctor view opens with the token stripped from the URL → doctor note shows on the dashboard → CSV downloads → invite link → import a Logger line → delete everything → doctor link answers "This link has expired". Zero CSP violations or script errors.

## 5. Manual preview check (after each CLAD slice)

From the brief's "After the build":
- [ ] Interactive Preview: sit where Ramesh sits; the setup panel and the centre of the table are in view with the head straight.
- [ ] Turning left with right-drag brings the left diyas into view; turning back hides them.
- [ ] No text, score or timer appears during the task.
- [ ] The bell clearly comes from the left (headphones).
- [ ] Chipped gaps are readable at 65 cm; nothing is dark.
- [ ] Report text reads easily; buttons are big.
- [ ] Label each item "logic proven" or "feel unproven" in the README.

## 6. Web QA matrix (Purna Family)

| Check | 360 px Android Chrome | 390 px iPhone Safari | 1440 px desktop |
|---|---|---|---|
| Pair with a real code | | ✓ (Chrome 390, local) | |
| Dashboard with 1 and 10 sessions | | | |
| Session replay animates and replays | | | |
| Doctor link opens logged out; CSV; print | | | |
| Delete everything | | | |
| Keyboard only; focus visible | | | |
| Dark mode; reduced motion | | dark ✓ | |
| Zero console errors | | ✓ | ✓ (doctor) |

## 7. Judge simulation (Sat 5 Dec and Mon 7 Dec)

Someone who hasn't seen Purna gets: the Devpost page, the video, the repo. Without help, can they answer: who is it for, what's the moment, why glasses, does it work, what's honest about its limits? Fix whatever they can't answer.
