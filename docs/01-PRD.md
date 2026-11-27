# 01 — PRD: Purna

**One line:** A SPECS Lens that turns the paper scanning exercise for spatial neglect into lighting diyas on your own dining table, with a replay that shows you the half you skipped, and a family web app that carries the results to the people who care.

**Event:** Learn AR with SPECS, Round 2 (Devpost). Deadline **Mon 7 Dec 17:00 ET = Tue 8 Dec 03:30 IST**. Live review **Thu 3 Dec 22:30 IST**.
**Source of truth for the Lens:** `devpost/design-brief.md` (approved by Harsh). If this PRD and the brief disagree, the brief wins; fix the PRD.
**Why each choice:** `docs/10-RESEARCH.md`.

---

## 1. Problem

After a right-hemisphere stroke, many people stop attending to the left half of space. They eat half the plate, miss half the page, bump the left door frame, and don't notice. Therapists train scanning with paper cancellation sheets in a clinic, but in India only a small share of stroke survivors ever see an occupational therapist, and paper can't see how a person moves their head.

## 2. Users

| User | Who | Needs | Touches |
|---|---|---|---|
| Patient | Ramesh, 64, right-side stroke in March, at home | A short, dignified daily practice; no reading, no failing sounds; one hand | The Lens |
| Carer | Priya, his daughter (or son, spouse) | Start it in 10 seconds; know it went okay; keep the therapist informed | Setup panel, Purna Family |
| Therapist | His occupational therapist | Real numbers between visits; decide the next level | Doctor link |
| Judge | Devpost judges | See it work in the preview, understand why, trust the build | Video, repo, README |

## 3. Goals and non-goals

**Goals**
- G1. One spatial moment, done well: the stuck-then-turn-left moment on the table.
- G2. Hints that point to the side, never to the answer.
- G3. A replay that makes the skipped half visible.
- G4. A report with clinical-style measures, honestly labelled.
- G5. Results reach family and therapist, with consent and no identity on the glasses.
- G6. Everything in the done criteria checkable in the Lens Studio preview, with LEAF tests.

**Non-goals**
- Diagnosis or medical claims. Recognising the real table. Memory inside the Lens. Right-side neglect mode. Voice. Custom gestures. Any camera, mic or location use.

## 4. Scope

| Tier | What | Done criteria |
|---|---|---|
| **Must (submission)** | Setup panel; table task (whole + chipped diyas); hints + beam + fading; head-yaw tracking with test override; replay; report card + Logger JSON; Send to family + pairing code; Purna Family (pair, sessions, trends, 2D replay, doctor link, delete-all) | C1–C5 |
| Add-on 1 | Drift warm-up (leftward only) | A1 |
| Add-on 2 | Far board at 2 m (far pinch) | A2 |
| Later (not in this hackathon) | Real table placement, right-side mode, therapist accounts, reminders by SMS/WhatsApp, Hindi/Gujarati UI | – |

**Cut rule:** add-ons start only if C1–C5 pass in LEAF by **Fri 4 Dec 21:00 IST**.

## 5. The session (patient flow)

1. Carer puts SPECS on the patient, opens Purna. The **setup panel** floats 50 cm ahead, just above the table.
2. Carer picks Difficulty (default Standard), Hint delay (default 6 s), Beam on/off (default on), Drift (default off), Far board (default off), Share with family (default **off**), and presses **Start**. The panel disappears.
3. *(Drift, if on, 45 s)* A row of diyas floats leftward across the table; one flickers every few seconds; pinch it.
4. **Table task (90 s max).** Whole and chipped diyas appear. Patient pinches whole ones. Hints fire per the rules in §6. Task ends when every whole diya is lit or time runs out.
5. *(Far board, if on, 60 s)* Same rules on the board 2 m away, far pinch.
6. **Replay.** The thread draws through the lit table diyas in order (0.4 s per step); missed whole diyas pulse.
7. **Report card** with four tiles and buttons Replay, Send to family (if sharing on), Done. Session JSON is printed to the Logger.
8. *Send to family* → posts the session. If this glasses device isn't paired yet, the card shows a pairing code (e.g. `DIYA-7K2P`) for the carer to type into Purna Family.

## 6. Lens functional requirements

| ID | Requirement |
|---|---|
| L1 | Table stand-in `PreviewTable (stand-in)`: 70 × 45 cm, centre (0, −30, −65) cm, hidden on device |
| L2 | Layout per difficulty: Easy 8 whole + 8 chipped (6 cm, 8 cm gap); Standard 12 + 12 (6 cm, 8 cm); Hard 16 + 16 (5 cm, 7 cm). Whole diyas split exactly half left / half right; chipped diyas split half left / half right and, within each side, half chipped-on-left / half chipped-on-right. No item centre within 3 cm of x = 0 or 4 cm of the table edge. Deterministic from a seed |
| L3 | Pinch whole → lit (flame + tone); chipped → tick only; lit → nothing visible. Every pinch is logged with time, item, side, kind, chip side and head yaw |
| L4 | Hint 1: when no diya has been lit for `hintDelay` s (counted from task start or the last lit diya) and ≥ 1 whole diya with x < −3 cm is dark → bell from the table's left edge + beam pulses twice. Hint 2: `hintDelay` s after Hint 1 with nothing lit → beam sweeps left edge → centre → left edge over 3 s. At most one Hint 1 and one Hint 2 per stuck spell; lighting any diya ends the spell |
| L5 | No hint while every left whole diya is lit |
| L6 | Beam level 0–3 (3 = full, 0 = off). Starts at 3 if "Beam on", else 0. −1 after every 4 consecutive left-side lit diyas made with no hint in the current spell; +1 whenever Hint 1 fires; clamped. Hint 1 makes the beam visible for its pulse even at level 0 |
| L7 | Nothing ever highlights or points at a particular diya (except SIK's own hover highlight when aimed at) |
| L8 | Head yaw sampled every frame from the camera (`yawFromForward`), positive = left. A `yawOverrideDeg` input replaces it when set (tests) |
| L9 | Replay draws a thread through lit table diyas in lit order, 0.4 s per segment; missed whole diyas pulse (1.2 s loop) until Done. Replay button replays it |
| L10 | Report card: 4 tiles (§8) + "Practice result, not a diagnosis. Share it with your therapist." |
| L11 | On report, print the session JSON (schema `purna.session.v1`, `03-ARCHITECTURE.md` §5) to the Logger in one line prefixed `PURNA_SESSION ` |
| L12 | Send to family (only if sharing on): POST the JSON to `/api/v1/sessions`. Show "Sent ✓" or the pairing code. On any failure show "Couldn't send. Saved to the Logger." |
| L13 | Drift (add-on): 8 diyas spawn at the right edge, move at 10 cm/s toward −x only; one flickers for 2 s every 3–4 s; pinch during flicker = hit |
| L14 | Far board (add-on): `PreviewBoard (stand-in)` 200 × 90 cm at (0, 0, −200); Easy 6+6, Standard 8+8, Hard 10+10, 18 cm diyas, 22 cm gap; far pinch; its own report numbers; not in the replay |
| L15 | No score, timer, text or progress during a task |
| L16 | Debug-only `PurnaSelfTest` (prints PASS/FAIL per done criterion) and `PurnaDemoDirector` (plays a scripted session for recording); both off by default and never referenced by the controller |

## 7. Purna Family functional requirements

| ID | Requirement |
|---|---|
| F1 | `POST /api/v1/sessions` accepts a session from a Lens (`deviceId` + session JSON), validates it, stores it, and returns `{ sessionId, linked, pairCode? }`. Unlinked devices get a pairing code valid 72 h |
| F2 | Pairing: on purna.dualmindlab.tech, a carer types the code and a display name ("Papa", "Ramesh"); the server creates a patient, links the device and its past sessions, and returns a **family key** stored in the browser |
| F3 | Invite: a family member can copy an invite link (`/join#k=<family key>`) to add a sibling. The key lives only in the URL fragment and localStorage |
| F4 | Dashboard: newest-first session cards with a plain-language line ("Found 9 of 12 on the left and 12 of 12 on the right. 1 hint. Turned up to 24° left."); a trend chart (left found %, right found %) over sessions; tap a card → session detail with a 2D replay of the table |
| F5 | Doctor link: "Share with doctor" creates a read-only link (`/doctor#t=<token>`) that expires in 7 days; it can be revoked. The doctor view shows every measure, trends, CSV download, print-friendly layout, and a notes box |
| F6 | Doctor notes appear on the family dashboard, labelled with the date |
| F7 | Delete everything: one button, confirm by typing the display name; removes patient, sessions, devices, shares and notes |
| F8 | Import: paste the `PURNA_SESSION` JSON from the Logger (fallback when the Lens couldn't send) |
| F9 | Gentle nudge on the dashboard if no session in 3 days ("No practice since Monday"). No push notifications |
| F10 | Privacy: no names or identity from the glasses; display name is typed by the family; keys and tokens stored hashed; no analytics or third-party scripts |
| F11 | The home page (top section) explains Purna in plain words and doubles as the landing page for judges |

## 8. Report measures (Lens tile → field)

| Tile | Shows | Fields |
|---|---|---|
| Left vs right | "Left 9 / 12 · Right 12 / 12" as two bars | `near.leftHits/leftTotal`, `rightHits/rightTotal` |
| Chipped-diya test | "Gap on left: 2 lit · Gap on right: 0 lit" | `near.fpChipLeft`, `near.fpChipRight` |
| Search order | "Orderly: 0.82 · Crossings: 1 · Revisits: 0" | `near.bestR`, `near.crossings`, `near.revisits` |
| Head turn | "Turned up to 24° left" | `head.maxLeftDeg` |

Full measures (CoC, asymmetries, time by column, cue counts, far numbers) live in the JSON and the doctor view (`03-ARCHITECTURE.md` §5).

## 9. Copy (exact strings)

| Key | Text |
|---|---|
| setup.title | Purna |
| setup.subtitle | Set up today's practice |
| setup.difficulty | Difficulty |
| setup.level.easy / standard / hard | Easy · Standard · Hard |
| setup.hintDelay | Hint after |
| setup.beam | Start with the beam |
| setup.drift | Warm-up |
| setup.far | Far board |
| setup.share | Share with family |
| setup.start | Start |
| report.left | Left vs right |
| report.chipped | Chipped diyas |
| report.order | Search order |
| report.head | Head turn |
| report.disclaimer | Practice result, not a diagnosis. Share it with your therapist. |
| report.replay | Replay |
| report.send | Send to family |
| report.done | Done |
| report.sent | Sent to family ✓ |
| report.pair | Ask your family to enter this code at purna.dualmindlab.tech |
| report.failed | Couldn't send. Saved to the Logger. |
| summary | Found {L} of {LT} on the left and {R} of {RT} on the right. {H} hint(s). Turned up to {Y}° left. |
| web.hero | Practice that makes the world whole again. |
| web.sub | Purna is a 4-minute daily exercise on SPECS glasses for people who miss the left side after a stroke. Their family sees how it went. Their therapist gets the numbers. |
| web.disclaimer | Purna is a practice tool, not a medical device. It doesn't diagnose or treat. Talk to your therapist. |

## 10. Edge cases

| Case | Behaviour |
|---|---|
| Patient lights nothing for the whole task | Hints fire once each per spell; task times out at 90 s; report shows 0s honestly |
| All left diyas lit first, right untouched | No hints; task times out or finishes; report shows the right-side misses |
| Pinch lands between two diyas | SIK picks one target; colliders are the diya size, not larger |
| Same diya pinched twice quickly | Second pinch = revisit (no double count) |
| Sharing off | Send button hidden; JSON still printed to the Logger |
| Network down / 5xx / timeout (8 s) | "Couldn't send. Saved to the Logger." No retry loop |
| Pairing code expired | Server returns a fresh code on the next send |
| Same code typed twice | Second attempt gets "Already paired. Ask your family for the invite link." |
| Doctor link expired or revoked | "This link has expired. Ask the family for a new one." |
| Malformed or huge JSON (import or POST) | 400 with a reason; nothing stored |

## 11. Success (for the hackathon)

- Stage One passes: plan-lens brief in `devpost/`, built with CLAD + Lens Studio MCP, runs in the preview.
- LEAF: C1–C5 pass, run at least 3 times each. Vitest: all core tests pass, core coverage ≥ 85%.
- The patient bench separates the three simulated players on every seed tested.
- Video ≤ 2:50 shows: the stuck moment, the hint, the head turn, the replay, the report, the family card arriving.
- README "For judges" table maps all four criteria to evidence.
