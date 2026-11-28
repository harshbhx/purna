# Purna: Devpost submission text

Paste-ready text for the Devpost form. Lines marked **[after CLAD]** are filled in once the Lens runs in the preview and LEAF has passed; nothing else changes. Keep the honest labels.

---

## Tagline (max 60 characters)

Practice that makes the world whole again.

## Elevator pitch (max 200 characters)

A SPECS Lens for people who miss the left side of the world after a stroke: light lamps on your own dining table, get a hint from the left, see your own search. Results go to family and therapist.

---

## Inspiration

After a stroke on the right side of the brain, many people stop noticing the left half of space. They eat the right half of the plate, read the right half of the page, bump the left door frame, and usually don't know it. It's called **left spatial neglect**, and it follows roughly 40% of right-hemisphere strokes.

Therapists train it with paper "cancellation" sheets: cross out every target on the page. It works in the clinic, but in one multicentre Indian study only **7.6%** of stroke survivors got occupational therapy at all, and paper can't see where your head turns.

We wanted that exercise at home, on the person's own dining table, in something that feels like lighting lamps rather than taking a test. Purna (पूर्ण) means "whole".

## What it does

**On the glasses (Snap SPECS):**

1. A carer puts the glasses on and picks a level: Easy, Standard or Hard. Sharing is off unless they turn it on.
2. Small clay **diyas** appear across the real table, split exactly half left, half right. Some are **whole**; some are **chipped**, with a gap on their left or right side.
3. Pinch a whole diya and it lights with a warm tone. Pinch a chipped one and nothing happens but a soft tick. There is no score, no timer and no failure sound.
4. Stuck on the right for 6 seconds with dark diyas still on the left? A **temple bell rings from the left** and a soft beam pulses there. Six seconds more, the beam sweeps left. **The hint points to the side, never to the answer.** The beam fades as the person starts finding left diyas on their own.
5. When the table is done, a glowing **thread replays the search path**. The numbers show the order the diyas were found; the ones missed pulse where they were. The person sees their own blind half.
6. A report card shows four measures in plain words, labelled "Practice result, not a diagnosis". One pinch sends it home.

**Purna Family** ([purna.dualmindlab.tech](https://purna.dualmindlab.tech)) is the web side:

- **Families** type the code shown on the glasses once (like `DIYA-7K3P`). Then every session arrives as one plain sentence, two left/right bars and a trend line, and brothers and sisters join with an invite link.
- **Therapists** get a read-only link that lasts 7 days and can be stopped at any time: every session with the numbers a cancellation test gives (Centre of Cancellation, egocentric and allocentric asymmetry, search order, crossings, revisits, head turn), a 2D replay, CSV export, a print layout, and a notes box that sends a note back to the family.
- **"Three ways to search the same table"** on the home page explains the measures: one layout, played by three simulated searchers through the real engine. Switch between them and the measures that give each one away light up.

**[after CLAD]** Add-ons built: warm-up with diyas drifting leftward only / far board at 2 m (keep only what passed LEAF).

## How we built it

**Planned with the skill pack.** We started in plan-lens: the brief, the user (Ramesh, 64, who had a right-side stroke in March and now misses the left half of his world), the single spatial moment ("stuck, a bell from the left, the head turns"), and five done criteria that can each be checked in the preview. All of it is in the repo's `devpost/` folder.

**One engine, two homes.** Every rule (layout, hint timing, beam fading, metrics, the report) lives in plain TypeScript in `Assets/Scripts/Core`, with no Lens Studio globals. The Lens calls `PurnaEngine` every frame; Node runs the same files in tests. 47 unit tests cover it at 98.9% line coverage: layout rules on 500 seeds × 3 levels, hint timing to the frame, beam fading, every metric, and the engine's phases.

**Built in Lens Studio with CLAD and the Lens Studio MCP.** **[after CLAD]** CLAD built the scene from the brief: Spectacles Interaction Kit pinch on each diya, a spatial AudioComponent for the bell at the table's left edge, UI Kit panels for setup and the report, head yaw from the camera every frame. LEAF scenarios test each done criterion with a head-yaw override (C1 table setup, C2 pinches, C3 hints, C4 replay, C5 report and send): **[after CLAD: LEAF results, runs × pass]**.

**Does it measure the right thing? The patient bench.** Three scripted searchers play the real engine on 200 layouts each: one who searches the whole table, one who misses the left of the table (left neglect), and one who misses the left of each object (object-centred neglect). Purna's report tells them apart on every seed: the left-neglect searcher finds 65% of left diyas, needs 2.9 hints and turns 16° left; the object-neglect searcher finds every whole diya but lights 5.6 diyas with the gap on the left. These are simulated players, not patients.

**Purna Family** is a Cloudflare Worker with D1. Family keys and doctor tokens are 32 random bytes and stored only as SHA-256 hashes. The web app is React with shadcn/ui, React Bits and Aceternity-style effects, behind a strict Content Security Policy (no third-party scripts). A **contract test** runs the real engine through every level, add-on and searcher and checks that each session passes the server's validator, so the glasses and the server can't drift apart.

**Tested like a product.** 200 automated tests: Core, bench and sounds 60, Worker and local D1 74, web components 38, and 28 end-to-end tests in real Chrome at phone and desktop sizes. The end-to-end suite runs axe accessibility checks (WCAG 2.1 AA) on every screen in light and dark mode, walks the keyboard path, and plays the whole family loop: pair, share with the doctor, note back, delete everything. GitHub Actions runs it all on every pull request and deploys after green CI on main.

## Challenges we ran into

- **Telling two kinds of neglect apart.** A plain "find all the targets" task can't separate missing the left of the room from missing the left of each object. Chipped diyas with the gap on a known side (after Ota's cancellation test) made the second visible, and the bench proved the report separates them.
- **Hints that don't do the work.** An arrow to the next diya would raise the score and teach nothing. The bell and beam only say "look left", and the beam fades as the person stops needing it.
- **Motion direction matters.** Research suggests leftward motion reduces neglect while rightward may worsen it. The warm-up only ever moves left, and a unit test fails the build if that changes.
- **An additive display.** Black is invisible on SPECS, so every colour is warm and bright, and the stand-in table stays dim so the diyas are always the brightest thing.
- **Keeping the glasses and the server in step.** Session JSON is one versioned contract (`purna.session.v1`), validated field by field, under 64 KB, and tested against everything the engine can produce.

## Accomplishments that we're proud of

- The replay. Showing people where they looked improved neglect and self-awareness in a crossover study, and on the glasses it's one glowing thread on their own table.
- Every design choice traces to a published finding, listed with sources in `docs/10-RESEARCH.md`.
- Privacy by design: nothing identifying leaves the glasses, keys are stored as one-way hashes, doctor links expire, pairing and notes are rate-limited, and one button deletes everything.
- A family site that passes automated accessibility checks on every screen, in both colour modes, with no sideways scrolling from 320 to 1440 px.

## What we learned

- Neglect is not one thing. Measuring both "the person's left" and "each object's left" changed the whole design.
- Family-led rehabilitation didn't reduce death or dependency in India's ATTEND trial. So Purna gives families visibility and leaves the therapy decisions to the therapist.
- Putting the logic in plain, tested TypeScript before opening Lens Studio meant CLAD could build the scene against an engine that was already proven.

## What's next for Purna

- Sessions with real stroke survivors and their therapists, with ethics approval. Today the feel is unproven and the measures are validated only on simulated players.
- Hindi and Gujarati voice and text on the glasses and the family site.
- A far board across the room, and furniture other than the dining table.
- Longer pairing codes or a global rate limit before any public use (today's limits are per Cloudflare location).

**Purna is a practice tool, not a medical device. It doesn't diagnose or treat.**

---

## Built with

`lens-studio` `snap-spectacles` `clad` `lens-studio-mcp` `spectacles-interaction-kit` `typescript` `vitest` `cloudflare-workers` `cloudflare-d1` `react` `vite` `tailwindcss` `shadcn-ui` `react-bits` `playwright` `axe-core` `github-actions`

## Links

- Repo: https://github.com/harshbhx/purna
- Purna Family: https://purna.dualmindlab.tech
- Video: **[YouTube link]**

## Disclosures (pre-existing work and tools)

- **AI coding assistants:** Claude (Anthropic) wrote most of the code, tests and documentation with Harsh directing, reviewing and testing; CLAD built the Lens scene in Lens Studio.
- **Third-party code in the family site:** React Bits components (BlurText, CountUp, Magnet, ShinyText, SpotlightCard; MIT + Commons Clause), components following shadcn/ui's patterns over Radix UI (MIT), and effects written for Purna after Aceternity UI's patterns. Credits and licences in `family/THIRD_PARTY.md`.
- **Fonts:** Mukta by Ek Type and Geist by Vercel, both SIL Open Font License, self-hosted.
- **Research:** the clinical findings behind each design choice are cited in `docs/10-RESEARCH.md`. No patient data was used; every session shown is from simulated players.
- **Sound and music:** the light tone, tick, temple bell, click and shimmer are original, synthesised in code by `tools/scripts/sounds.ts` and tested against the design spec. The video uses no music beyond these sounds.

## Testing instructions for judges

1. **The Lens:** open the project in Lens Studio 5.x, press Preview. Pick Standard, then Start. Light the right-side diyas and wait 6 s to hear the bell from the left. Light everything, watch the replay, read the report. **[after CLAD: any preview tips, e.g. right-drag to turn the head]**
2. **Purna Family:** open https://purna.dualmindlab.tech and press **See an example**: a labelled demo dashboard from simulated sessions. Open any session for its replay and measures.
3. **Three ways to search:** on the home page, switch between the three searchers under "Three ways to search the same table".
4. **Tests:** `cd tools && npm ci && npm test`, then `cd family && npm ci && npm test && npm run test:web && npm run test:e2e`.
