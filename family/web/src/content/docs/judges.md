# For judges

Everything you need to judge Purna, on one page: what it is, how to try it in five minutes, where each criterion is answered, the numbers, and what's honestly not done yet.

## Purna in one minute

- **Who it's for:** People who miss the left side of the world after a stroke on the right side of the brain (left spatial neglect), practising at home with a carer. Their family follows along; their therapist gets the numbers.
- **The one spatial moment:** You light clay diyas on your own dining table, stall on the right, and a temple bell rings **from your left**. Your head turns. The hint points to the side, never to the answer.
- **Why glasses:** At the table the glasses' display covers about 37 cm of a 70 cm table, so finding every diya needs the head turn therapists retrain, and the glasses can measure it. Paper and tablets only see where you tapped.
- **What comes back:** A replay of the search, warm light where the head pointed (the attention map), and a plain-words report that goes to the family and, through a 7-day link, to the therapist, who can set the next session.
- **Honest status:** The engine, the measures and the family site are built, tested and live. The Lens is built in Lens Studio with CLAD. Nobody with neglect has tried it yet.

## Try it in five minutes

1. **[Try the table](https://purna.dualmindlab.tech/play)** with headphones on. It opens in 3D, as if you're wearing the glasses: diyas only appear inside the display's frame. Stall on the right for 6 seconds and listen. Finish to see your replay, attention map and report. Then tick **Feel neglect** and play again.
2. **[The home page](https://purna.dualmindlab.tech)**: the night table, then **Three ways to search the same table**, where one layout is played by three simulated searchers and the measures that give each away light up.
3. **See an example** on the home page: a family's dashboard from nine simulated sessions. Open any session for its replay.
4. **[The example therapist view](https://purna.dualmindlab.tech/doctor#demo)**: every session's numbers, the trend with its day-to-day band, where the time went, published references as context, and **Set the next session** (try it; the example doesn't save).
5. **The Lens** in Lens Studio 5.23: open the repository, press Preview, pick Standard, then Start.

## Where each criterion is answered

| Criterion | Evidence |
|---|---|
| **Stage One** | Planned with plan-lens ([answers](https://github.com/harshbhx/purna/blob/main/devpost/plan-lens-answers.md), [design brief](https://github.com/harshbhx/purna/blob/main/devpost/design-brief.md)); built with CLAD and the Lens Studio MCP ([prompts](https://github.com/harshbhx/purna/blob/main/docs/05-PROMPTS.md)); runs in the preview |
| **Design** | One moment done well; layout in centimetres for a seated person; warm, bright colours for an additive display; no score, timer or failure sound; nothing flashes more than three times a second; every diya reachable with a ray from a resting hand |
| **Technical** | One engine in plain TypeScript for the glasses, the tests and the browser; a versioned data contract checked against everything the engine can produce; hashed keys, a strict content security policy, rate limits, automatic data clean-up; 286 automated tests on every change ([how it's built](#architecture)) |
| **Innovation** | The attention map; the therapist setting the next session; the table in 3D in any browser; chipped diyas that separate neglect of "my left" from "each object's left" ([evidence](#evidence)) |
| **Presentation** | This page, the [README](https://github.com/harshbhx/purna), the Devpost story, the video, and these docs |

## The numbers

Three scripted searchers played the real engine on the same 200 table layouts. **They're simulated players, not patients.**

| Average over 200 layouts | Healthy | Left neglect | Object neglect |
|---|---|---|---|
| Left diyas found | 100% | 64.8% | 100% |
| Hints per session | 0 | 2.92 | 0.01 |
| Centre of Cancellation | 0.000 | 0.198 | 0.000 |
| Chipped-on-left diyas lit | 0 | 0 | 5.63 |
| Head on the left half of the table | 49.9% | 4.4% | 51.9% |

The software runs **286 automated tests** on every change: 79 for the engine (99% of its lines), 84 for the server, 72 for the site's components and 51 in a real browser on a phone and a desktop, including accessibility scans in light and dark. Everything is on [Results so far](#results).

## What's built and what isn't

| Part | State |
|---|---|
| Engine: layout, hints, beam fading, measures, attention map, report, next session | Built and tested (logic proven) |
| Do the measures separate search styles? | Yes, on simulated players; not yet on patients |
| Family site, therapist view, docs, the table in 3D | Live at purna.dualmindlab.tech, accessible in light and dark |
| The Lens scene in Lens Studio | Built by CLAD; checked in the preview |
| How it feels to a stroke survivor | Not known yet (feel unproven) |

## Worth noticing

- **The hint never points at a diya.** The searching is the exercise; an arrow would do the work.
- **The warm-up only moves left**, because rightward motion may make neglect worse. A test fails the build if that changes.
- **Published cut-offs are shown as context, never as pass or fail**: they come from paper tests with more targets.
- **The family watches; the therapist decides.** A large trial found family-led rehabilitation didn't reduce dependency.
- **Privacy by design:** nothing identifying leaves the glasses, and one button deletes everything.

## Questions you might have

**Why not a phone or tablet?** A phone is held in the good hand and shows the table through a small window, so the head never has to turn. Neglect is about where attention goes in space; on glasses the whole table is the canvas, the hands are free, and head direction comes for free.

**Is this a medical device?** No. It's practice, labelled that way everywhere. Whether neglect training changes daily life is still uncertain, and the docs say so.

**How do you know the measures mean anything?** They follow published cancellation-test scoring (Centre of Cancellation; the Apples Test's asymmetries), and on simulated players they separate three search styles. Checking them against standard assessments with real patients is the next step.

**What did AI tools do?** Claude wrote most of the code, tests and docs with Harsh directing, reviewing and testing; CLAD built the Lens scene in Lens Studio. Third-party code and fonts are credited in the repository.

## Links

- Live site: [purna.dualmindlab.tech](https://purna.dualmindlab.tech)
- Repository: [github.com/harshbhx/purna](https://github.com/harshbhx/purna)
- One-page guide in the repository: [JUDGES.md](https://github.com/harshbhx/purna/blob/main/JUDGES.md)
- Contact: [harshbhx@gmail.com](mailto:harshbhx@gmail.com)

Last reviewed: 28 November 2026.
