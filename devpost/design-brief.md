---
status: draft
---

# Design brief: Purna

<!-- Filled in by plan-lens from Harsh's interview answers (devpost/plan-lens-answers.md). Uses his words. Values he didn't choose are marked (default). -->

## The one spatial moment
Ramesh, 64, had a right-side stroke in March and now misses the left half of his world. At his dining table, wearing SPECS, he lights the whole clay diyas on his right and stops, sure he's done. A soft temple-bell rings from his left and a warm amber beam on the table's left edge pulses; he turns his head left, finds the dark diyas waiting, and lights them. When the task ends, a glowing thread draws his own search across the table in the order he lit the diyas, and the ones he missed pulse: for the first time he can see the half he skipped.

## Why it belongs on glasses
- Uses: draws in the world, leaves your body free, shares your view (head direction is measured and drives the hints).
- Why it's better than the phone or laptop version: the view at the table is only about 45 cm wide (SPECS: about 37° tall × 32° wide) and the table is 70 cm, so finding every diya needs a head turn to the left, which is exactly the habit his therapist is rebuilding, and the glasses can measure how far he turned. Paper and tablets only see where you tapped. His hands stay free, and the practice happens on the real table where he leaves food on the left of his plate.

## Product or overlay
- Type: product. A trainer that sits on a flat surface in front of a seated person; it doesn't need to recognise anything.
- What the real version would sense: the table surface, head direction (yaw), and his pinch. No camera frames, no microphone, no faces, no object recognition.
- Stand-in for the preview:
  - `PreviewTable (stand-in)`: a virtual dining table, 70 × 45 cm, hidden on device.
  - `PreviewBoard (stand-in)`: a virtual wall board 2 m away for the far-space add-on, hidden on device.
  - Head turns come from mouse-look in the preview. A head-yaw override input lets LEAF tests set the yaw directly (LEAF may not be able to turn the preview camera).
  - Send to family posts to the Purna Family web app (works in the preview with Device Type Override = Spectacles). With no network, the same session JSON prints to the Logger.

## Where things live
- Where the user is looking during the main task: down at the table in front of him, turning his head left and right. Seated; the head starts at the origin looking down −z.
- Table (stand-in): flat, centre 65 cm ahead and 30 cm below eye level; 70 × 45 cm.
- Diyas on the table: spread over the table, half left of centre and half right, never inside a 3 cm band on either side of the centre line. 6 cm wide, at least 8 cm apart (Hard: 5 cm wide (default), 7 cm apart). Whole diyas are complete clay lamps; chipped diyas have a visible piece missing on their left or right side (a cut-out, not dark paint).
- Anchor beam: upright strip along the table's left edge, 2 cm wide, 25 cm tall, warm amber.
- Bell: spatial sound placed at the table's left edge.
- Setup panel: 50 cm ahead, just above the table, facing him; 30 × 20 cm. Hidden after Start.
- Drift row (add-on): a line of 6 cm diyas floating across the middle of the table.
- Far board (add-on): standing 2 m ahead at eye height, 200 × 90 cm, diyas 18 cm wide (same apparent size as the table diyas).
- Replay thread: a thin glowing line drawn on the table, joining the lit diyas.
- Report card: lying at the centre of the table, tilted toward him; 28 × 18 cm, four big tiles and three big buttons.
- Colours: warm clay, gold and amber everywhere; nothing relies on black or dark content.

## Hands and input
- Pinch a whole diya: it lights with a small flame and a soft, warm tone.
- Pinch a chipped diya: a quiet neutral tick, nothing else. No red flash, no error buzz.
- Pinch a lit diya: nothing visible; logged as a revisit.
- No reaching: every diya on the table can be pinched with SIK's ray from a hand resting in his lap, as well as by touch. A right-hemisphere stroke often weakens the left arm, so lighting a left diya must never mean reaching across the body.
- Setup panel (used by the carer): Difficulty (Easy 8+8 / Standard 12+12 / Hard 16+16) and Hint delay (4 / 6 / 10 s) arrive preselected with what the glasses suggest from the last sessions, with a one-line reason under them ("Every diya found without hints, twice in a row. Try Hard."); the carer can change either. Then Beam starts on/off, Drift warm-up on/off, Far board on/off, Share with family on/off (off by default), and a big Start button.
- Report card: Replay, Send to family (only shown if sharing is on), Done.
- Far board: far pinch with SIK's ray, so he never stands or reaches.
- Targets are big (5 cm or more) and highlight when aimed at.
- Voice (if any) and the button that does the same job: no voice. Stroke can affect speech; pinch is enough.
- Add-on, only after the done criteria pass: "Look to light" on the setup panel (off by default) for people who can't pinch. Holding the head on a diya for 1.5 s fills a ring around it and then counts as a pinch; chipped diyas still only tick. Everything else, hints and replay included, is unchanged.

## When things show
- During a task: only the diyas and the beam. No score, timer, text or progress bar.
- Hint 1: 6 s with no diya lit while at least one whole diya on the left is still dark → bell from the left and the beam pulses twice.
- Hint 2: 6 s more with nothing → the beam sweeps slowly from the left edge to the centre and back, like a lighthouse.
- Never an arrow, glow or highlight on a particular diya. The hint points to the side, never to the answer.
- No hint once every whole diya on the left is lit, even if the right isn't finished.
- Beam fading: one step dimmer after every 4 left-side finds made without a hint; one step brighter whenever a hint fires (4 levels, full to off).
- Drift (add-on): diyas only ever move leftward.
- A task ends when every whole diya is lit or its time runs out: Drift 45 s, table 90 s, far board 60 s. Session about 4 minutes.
- Replay: right after the last task, the thread draws through the lit table diyas in the order they were lit, about 0.4 s per step, while missed whole diyas pulse. Table only (default); the far board shows as its own numbers on the report.
- Report card: after the replay. Four tiles: Left vs right; Chipped-diya test; Search order (with path crossings and revisits); Head turn. One line underneath: "Practice result, not a diagnosis. Share it with your therapist."
- If something needs attention out of view: the bell from the left.

## Done criteria
Each one can be checked in Lens Studio's preview.
1. Pressing Start on Standard puts the table 65 cm ahead with 12 whole and 12 chipped diyas: 6 whole on each side of centre, chipped ones split evenly left and right, nothing inside the centre band, and the amber beam on the left edge.
2. Pinching a whole diya lights it with a flame and a tone; pinching a chipped diya only ticks; pinching a lit diya does nothing visible. All three are recorded in the session data with time and side.
3. After 6 s with nothing lit and a whole diya still dark on the left, the bell plays from the left and the beam pulses; after 6 s more, the beam sweeps. Once every left-side whole diya is lit, no hint fires, even if the right side isn't finished.
4. When the task ends, the thread draws through the lit diyas in the exact order they were lit, and every missed whole diya pulses.
5. The report card shows left vs right, the chipped-diya result, search order and head turn, and the full session data prints to the Logger. With sharing on, Send to family posts it to Purna Family and shows a short pairing code; with no network, the data is still in the Logger.

Add-on criteria (only if built): Drift diyas only ever move left; the far board gets its own left/right numbers on the report.

## Out of scope
- Recognising the real table (the stand-in table is used).
- Remembering sessions inside the Lens; Purna Family keeps the history.
- Diagnosis or any medical claim. Practice plus measurement only.
- Right-side neglect mode.
- Voice and custom gestures.

## Risks and open questions
- Feel unproven: comfort of four minutes of head turning for an older patient, pinch accuracy with a weaker hand, how clearly the bell's direction comes through the real SPECS speakers, far-pinch accuracy at 2 m.
- LEAF may not be able to turn the preview camera, so head-turn tests use the yaw override.
- Evidence that neglect training improves daily life is uncertain (Cochrane), so Purna never claims it does.
- Family role: the ATTEND trial found family-led rehab didn't reduce dependency, so family is for visibility and encouragement; the therapist runs the therapy.
- Hard level packs 5 cm diyas 7 cm apart; if pinches feel cramped in the preview, drop Hard to 14 + 14.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.
- The logic already exists as plain TypeScript in `Assets/Scripts/Core/` (PurnaEngine, Layout, CueEngine, Metrics, Drift, Report) with Node tests in `tools/`. Do not reimplement it. Write one component, `PurnaController`, that calls `engine.start()`, feeds `engine.tick(t, yawDeg)` every frame, calls `engine.pinch(t, itemId, yawDeg)` on a SIK pinch, draws what the engine returns, plays the bell and pulses/sweeps the beam on `frame.cue`, and calls `engine.report()` at the end. See `docs/03-ARCHITECTURE.md`.
- Head yaw: compute it from the camera's forward vector with `yawFromForward()` (positive = turned left). Give `PurnaController` a yaw-override input that tests can set; when set, it's used instead of the camera.
- Remove the template's `SIKExamples` object; keep `SpectaclesInteractionKit`.
- The diyas are the product: make them look good. Warm clay bodies, a small flickering flame when lit, chipped diyas with a clean cut-out on one side that reads clearly at 65 cm. Sounds: use the files in `Assets/Audio` (`light.wav` on light, `tick.wav` for chipped, `bell.wav` for the hint, `ui.wav` for buttons, `replay.wav` optional for the thread); don't generate new ones.
- Next session: keep the last 3 sessions' `SessionBrief` (from `briefOf(report)` in `Assets/Scripts/Core/Next.ts`) in persistent storage, and preselect the setup panel with `suggestNext(briefs)`, showing its `reason`. Don't write your own rules.
- Send to family uses `InternetModule.fetch` to POST the session JSON to the endpoint in `docs/03-ARCHITECTURE.md`; on any failure, print the JSON to the Logger.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
