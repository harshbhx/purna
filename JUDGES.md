# For judges

Everything you need to judge Purna in a few minutes, with links to the evidence. If you only have one minute, read the first section and press **See an example** on the site.

## In one minute

- **Who it's for:** people who miss the left half of the world after a right-hemisphere stroke (left spatial neglect), practising at home with a carer. Their family follows along; their therapist gets the numbers.
- **The one spatial moment:** you light clay diyas on your own dining table, stall on the right, and a temple bell rings **from your left**. Your head turns. The hint points to the side, never to the answer.
- **Why glasses:** at the table the view is about 45 cm wide and the table is 70 cm, so finding every diya needs the head turn the therapist is retraining, and the glasses can measure how far it went. Paper and tablets only see where you tapped.
- **Honest status:** the logic, the family site and the measures are built and tested; the Lens is built by CLAD in Lens Studio and runs in the preview; nothing has been tried with patients yet.

## Try it in two minutes

| Step | Where | What you'll see |
|---|---|---|
| 1 | [purna.dualmindlab.tech](https://purna.dualmindlab.tech) | The night table: the right half lights, the left stays dark, the bell, then whole |
| 2 | **See an example** on the home page | A family's dashboard from 9 simulated sessions, clearly labelled; open any session for its replay |
| 3 | **Three ways to search the same table** on the home page | One layout played by three simulated searchers; switch them and watch which measures give each one away |
| 4 | [The example therapist view](https://purna.dualmindlab.tech/doctor#demo) | Every session's numbers, the trend with its day-to-day band, where the time went, and published references as context |
| 5 | The Lens in Lens Studio (below) | The table, the pinch, the bell from the left, the replay, the report |

**Running the Lens:** open the repo folder in Lens Studio 5.x and press Preview. Pick **Standard**, then **Start**. Light the right-side diyas and wait 6 s for the bell from the left. Light everything, watch the replay, read the report. In Interactive Preview, right-drag turns your head and a click is a pinch.

## Where each criterion is answered

| Criterion | Evidence |
|---|---|
| **Stage One: planned with plan-lens** | [`devpost/plan-lens-answers.md`](devpost/plan-lens-answers.md) and the brief it produced, [`devpost/design-brief.md`](devpost/design-brief.md) |
| **Stage One: built with CLAD and the Lens Studio MCP, runs in the preview** | The Lens Studio project at the repo root; CLAD's prompts in [`docs/05-PROMPTS.md`](docs/05-PROMPTS.md); LEAF scenarios in `Assets/Tests` |
| **Design** | One moment done well; layout in centimetres for a seated person; colours for an additive display; no score, timer or failure sound during the task; sounds made for it ([design](docs/02-DESIGN.md)) |
| **Technical** | Logic in plain TypeScript shared by the Lens and Node, tested before Lens Studio opened; a contract test proves every session the engine can produce passes the server; rate limits, hashed keys, a strict CSP; 200+ automated tests on every pull request ([testing](docs/06-TESTING.md)) |
| **Innovation** | Cancellation-test measures from a pinch log and head yaw on real furniture; chipped diyas that separate "my left" from "each object's left"; a replay that shows a person their own blind half ([research](docs/10-RESEARCH.md)) |
| **Presentation** | This page, the [README](README.md), the [Devpost story](devpost/STORY.md), the video, and a live site with labelled examples |

## Status, honestly

| Part | State |
|---|---|
| Core logic (layout, hints, beam fading, metrics, report, next-session suggestion) | Logic proven: unit tests, 98.9% line coverage |
| Do the measures tell search styles apart? | Logic proven on **simulated players** (200 layouts each); not yet on patients |
| Purna Family (site, API, database, therapist view) | Works end to end in Chrome on phone and desktop; WCAG 2.1 AA checked with axe; the family dashboard also in Hindi |
| The Lens | Built by CLAD; LEAF results are in the README |
| How it feels to a stroke survivor | **Feel unproven.** Not yet tried with patients or therapists |

Purna is a practice tool, not a medical device. It doesn't diagnose or treat.

## Questions you might have

**Why not a phone or tablet?** A phone is held in the good hand and shows the table through a small window, so the head never has to turn. Neglect is about where attention goes in space; on glasses the whole table is the canvas, the hands are free, and head yaw is measured for free.

**Is this a medical claim?** No. Purna says "practice", never "treatment", and every result is labelled "Practice result, not a diagnosis". The evidence that neglect training changes daily life is still uncertain, and the docs say so.

**How do you know the measures mean anything?** They follow published cancellation-test scoring: Centre of Cancellation (Rorden and Karnath) and the Apples Test's egocentric and allocentric asymmetry (Bickerton and colleagues). The patient bench shows the report separates three scripted search styles on every seed. Published cut-offs are shown only as context, because they come from paper tests with more targets.

**Why diyas?** Lighting lamps is a calm, familiar act in Indian homes, nothing like a test. The chipped ones let the same task measure whether someone misses the left of each object.

**Why do hints never point at a diya?** The searching is the exercise. A hint that points at the answer would do the work for them.

**Why does the warm-up only move left?** Leftward motion has been found to reduce neglect, while rightward motion may worsen it. A unit test fails the build if that ever changes.

**What happens to the data?** Nothing identifying leaves the glasses. Sharing is off by default. Keys are stored as one-way hashes, doctor links expire, and one button deletes everything.

**What did AI tools do?** Claude wrote most of the code, tests and docs with Harsh directing, reviewing and testing; CLAD built the Lens scene in Lens Studio. Third-party code and fonts are credited in [`family/THIRD_PARTY.md`](family/THIRD_PARTY.md).

## Run the tests

```bash
cd tools && npm ci && npm test            # Core, patient bench, sounds
cd family && npm ci && npm test           # Worker + local D1, contract, rate limits
npm run test:web && npm run test:e2e      # React app; real Chrome on phone and desktop sizes
```
