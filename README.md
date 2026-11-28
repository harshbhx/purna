<div align="center">

<a href="https://purna.dualmindlab.tech"><img src="docs/img/readme/intro.gif" width="100%" alt="Purna (पूर्ण). Practice that makes the world whole again. A Snap Spectacles Lens for people who miss the left side of the world after a stroke, and a web app for their family and therapist. Beside it, clay diyas light up on a dark table: first the right half, then a warm beam on the left edge, then the left half."></a>

<br>

[![Try the table in your browser](https://img.shields.io/badge/%E2%96%B6%EF%B8%8E%20%20Try%20the%20table-in%20your%20browser-c2410c?style=for-the-badge&labelColor=17140f)](https://purna.dualmindlab.tech/play)
[![Therapist view](https://img.shields.io/badge/Therapist%20view-example-1f6feb?style=for-the-badge&labelColor=17140f)](https://purna.dualmindlab.tech/doctor#demo)
[![Docs](https://img.shields.io/badge/Docs-safety%20first-047857?style=for-the-badge&labelColor=17140f)](https://purna.dualmindlab.tech/docs)

[![CI](https://img.shields.io/github/actions/workflow/status/harshbhx/purna/ci.yml?branch=main&style=flat-square&label=CI&logo=githubactions&logoColor=white&labelColor=17140f)](https://github.com/harshbhx/purna/actions/workflows/ci.yml)
[![Live](https://img.shields.io/github/actions/workflow/status/harshbhx/purna/live.yml?branch=main&style=flat-square&label=live%20site&logo=cloudflare&logoColor=white&labelColor=17140f)](https://github.com/harshbhx/purna/actions/workflows/live.yml)
[![Uptime](https://img.shields.io/website?url=https%3A%2F%2Fpurna.dualmindlab.tech%2Fapi%2Fv1%2Fhealth&style=flat-square&label=purna.dualmindlab.tech&labelColor=17140f&up_message=online)](https://purna.dualmindlab.tech)
![Tests](https://img.shields.io/badge/tests-283%20passing-047857?style=flat-square&labelColor=17140f)
![Coverage](https://img.shields.io/badge/engine%20coverage-99%25-047857?style=flat-square&labelColor=17140f)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG%202.1-AA%20checked-1f6feb?style=flat-square&labelColor=17140f)](ACCESSIBILITY.md)
[![MIT](https://img.shields.io/badge/license-MIT-c2410c?style=flat-square&labelColor=17140f)](LICENSE)

**[For judges](JUDGES.md)** &nbsp;·&nbsp; [Features](#-what-no-one-else-does) &nbsp;·&nbsp; [How it works](#-a-session-in-four-minutes) &nbsp;·&nbsp; [Built with](#-how-its-built) &nbsp;·&nbsp; [Tests](#-tests) &nbsp;·&nbsp; [Accessibility](ACCESSIBILITY.md)

</div>

<br>

After a stroke on the right side of the brain, many people stop noticing the left half of the world. They eat half the plate and bump the left door frame, and don't know it. **Purna** (पूर्ण, *whole*) turns the therapist's paper exercise into lighting clay diyas on your own dining table through Snap Spectacles. Stall on the right and a temple bell rings **from your left**: the hint points to the side, never to the answer. Then your search is replayed on the table, and the half you skipped lights up.

> [!IMPORTANT]
> Purna is a practice tool, not a medical device. It doesn't diagnose or treat, and no regulator anywhere has reviewed it. Read the **[safety guide](https://purna.dualmindlab.tech/docs#safety)** first. If you think someone is having a stroke, call your local emergency number now.

<br>

<div align="center">
<a href="https://purna.dualmindlab.tech/play"><img src="docs/img/readme/play.gif" width="92%" alt="The diya table in the browser: only the diyas inside a narrow window, as wide as the glasses' view, are shown. The player lights two diyas on the right and stalls; a caption says a bell rings from the left; the view turns left and lights the diyas there."></a>
<br>
<sub><b>No glasses needed.</b> The same engine as the Lens, in your browser: only what's in your view shows, so you have to turn. <a href="https://purna.dualmindlab.tech/play"><b>Play it</b></a></sub>
</div>

<br>

## ✦ What no one else does

<table>
<tr>
<td width="50%" valign="top">

### 🔦 An attention map on your own table

After the replay, warm light fills the table where your head pointed. The side you never looked at stays dark. Paper and tablets only know where you tapped; glasses know where you looked.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/img/readme/replay-dark.png">
  <img src="docs/img/readme/replay-light.png" alt="A session replay: numbered diyas joined by a thread, missed diyas dashed, and warm vertical bands where the head pointed, bright on the right and faint on the left.">
</picture>

</td>
<td width="50%" valign="top">

### 🩺 The therapist sets the next session

From a 7-day read-only link, the therapist picks the next level and hint delay. The glasses load it once (*"Set by your therapist on 3 Dec"*), the family sees it, and the next session clears it.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/img/readme/plan-dark.png">
  <img src="docs/img/readme/plan-light.png" alt="The Set the next session card: level Easy, Standard or Hard, and hint after 4, 6 or 10 seconds, with a Set next session button.">
</picture>

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🪔 Play it, and feel it

[**/play**](https://purna.dualmindlab.tech/play) runs the Lens's engine in a browser with a view as narrow as the glasses'. Tick **Feel neglect** and the left of whatever you look at fades away, so a son or daughter can feel what their father can't see.

</td>
<td width="50%" valign="top">

### ◐ Two kinds of neglect from one table

Chipped diyas with the gap on a known side separate *"my left"* from *"each object's left"*, after the Ota and Apples cancellation tests. A simulated patient bench proves the report tells them apart.

</td>
</tr>
</table>

## ✦ A session in four minutes

| | | |
|:-:|---|---|
| **1** | **Set up** | A carer picks a level. The panel suggests one, from the therapist or from the last sessions, and reminds them: *sit down, with someone nearby.* |
| **2** | **Light the diyas** | Pinch the whole ones; leave the chipped ones. No score, no timer, no failure sound. Every diya can be reached with a ray from a resting hand. |
| **3** | **A bell from the left** | Stuck for 6 s with diyas still dark on the left: a bell rings from the left edge and a beam pulses. Nothing ever points at a diya. |
| **4** | **See your search** | The thread replays the path, the attention map lights where you looked, and one pinch sends a plain-words report home. |

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/img/readme/dash-dark.png">
  <img src="docs/img/readme/dash-light.png" alt="The family dashboard: Papa's practice, the latest session in one sentence with left and right bars, earlier sessions, a trend over time, and a note from the therapist.">
</picture>

<sub>The family sees one sentence per session and a trend; the therapist gets every number a cancellation test gives. Light or dark follows your system, or the switch in the header.</sub>

```mermaid
sequenceDiagram
    autonumber
    participant G as 👓 Glasses
    participant W as ☁️ Purna Family
    participant F as 👪 Family
    participant T as 🩺 Therapist
    G->>W: what should today's session be?
    W-->>G: the therapist's plan, or none
    G->>W: the session (purna.session.v1)
    F->>W: pair once with the DIYA code
    F->>T: a 7-day read-only link
    T->>W: a note, and the next session
    W-->>F: both, on the dashboard
```

## ✦ How it's built

```mermaid
flowchart LR
  subgraph L["👓 Snap Spectacles Lens · Lens Studio + CLAD"]
    C["PurnaController"] --> E["PurnaEngine<br/>plain TypeScript"]
  end
  E -. same files .-> P["🪔 /play<br/>in the browser"]
  E -. same files .-> N["🧪 Node tests<br/>+ patient bench"]
  C -- sessions --> W
  W -- next session --> C
  subgraph CF["☁️ Cloudflare · deployed from main"]
    W["Worker"] --> D[("D1<br/>hashed keys only")]
    W --- A["React app<br/>strict CSP"]
  end
  A --> F["👪 Family"]
  A --> T["🩺 Therapist"]
```

- **One engine, three homes.** `Assets/Scripts/Core` has no Lens Studio globals: the Lens calls it every frame, Node tests run it, `/play` runs it in the browser.
- **One contract.** Sessions are [`purna.session.v1`](docs/03-ARCHITECTURE.md#5-data-contract-purnasessionv1), validated field by field; a contract test runs every level through the server's validator.
- **Private by default.** No identity leaves the glasses. Keys are stored as SHA-256 hashes, doctor links expire, unpaired data is deleted after 30 days, and "Delete everything" removes it all.
- **Accessible.** WCAG 2.1 AA checked with axe on every screen in light and dark, a keyboard-only test, Hindi for the family's screens, and nothing in the Lens flashes faster than three times a second. [More](ACCESSIBILITY.md).

<details>
<summary><b>What the measures mean</b> (for therapists)</summary>
<br>

| Measure | What it catches |
|---|---|
| Left vs right | Whole diyas found on each half of the table |
| Chipped diyas | Diyas lit by mistake, by the side of their gap: missing the left of *objects* |
| Search order | How tidy the search was (0 scattered, 1 row by row), path crossings, revisits |
| Head turn and attention | How far left the head turned, and where it pointed on the table |

Centre of Cancellation (Rorden and Karnath), over the $n$ lit whole diyas at $x_i$ on a table with usable edges $x_{min}$, $x_{max}$:

$$\mathrm{CoC} = \frac{1}{n}\sum_{i=1}^{n}\left(\frac{2\,(x_i - x_{min})}{x_{max} - x_{min}} - 1\right)$$

The attention map splits the 70 cm table into 14 strips; a head yaw $\theta$ (positive = left) points at $x = -65\tan\theta$ cm. Published cut-offs come from paper tests with more targets, so they appear as context, never as a pass/fail line. Full definitions: [what the numbers mean](https://purna.dualmindlab.tech/docs#measures).

</details>

<details>
<summary><b>Does it measure what it should?</b> The patient bench</summary>
<br>

Three scripted searchers play the real engine on 200 layouts each. The left-neglect searcher finds fewer left diyas, needs hints and turns left less; the object-neglect searcher finds every whole diya but lights chipped-on-left ones.

<img src="docs/img/bench.svg" alt="Bar charts over 200 simulated sessions per player. Left diyas found: healthy 100%, left neglect 65%, object neglect 100%. Hints needed: 0, 2.9, 0. Chipped-on-left diyas lit: 0, 0, 5.6. Head turned left: 27°, 16°, 29°.">

> [!NOTE]
> These are **simulated players, not patients.** The bench proves the measures separate search styles; it says nothing yet about real people.

</details>

## ✦ Tests

| Suite | Command | Tests | Proves |
|---|---|:-:|---|
| 🧠 Engine + bench | `cd tools && npm test` | 79 | Layout on 500 seeds × 3 levels, hint timing, metrics, attention map, next session, sounds. 99% line coverage |
| ☁️ Worker + D1 | `cd family && npm test` | 84 | Every API route and error, field-by-field validation, the engine → server contract, rate limits, retention, the therapist plan |
| ⚛️ Web app | `npm run test:web` | 71 | Components in jsdom, the browser table on the real engine, the plan form, theme switch, docs, Hindi |
| 🌐 End to end | `npm run test:e2e` | 49 × 2 | Real Chrome on phone and desktop: every flow, keyboard only, axe in light and dark |

<details>
<summary><b>Run it yourself</b></summary>

```bash
cd tools && npm ci && npm test                     # the engine and the patient bench
cd family && npm ci
npx wrangler d1 migrations apply purna --local
npm run dev                                        # http://localhost:8787 (try /play)
npm run sample -- --post http://localhost:8787 0123456789abcdef0123456789abcdef   # prints a DIYA code
```

</details>

<details>
<summary><b>Status, honestly</b></summary>
<br>

- [x] Engine: layout, hints, beam fading, metrics, attention map, report, next session (**logic proven**)
- [x] Measures separate three search styles on simulated players (**logic proven**, not on patients)
- [x] Purna Family: live, accessible in light and dark, English and Hindi for families
- [ ] The Lens scene in Lens Studio, built by CLAD (in progress; LEAF results land here)
- [ ] How it feels to a stroke survivor (**feel unproven**)

</details>

<details>
<summary><b>Repo map</b></summary>
<br>

| Path | What |
|---|---|
| [`Assets/Scripts/Core/`](Assets/Scripts/Core) | The engine |
| [`tools/`](tools) | Engine tests, patient bench, bench chart, sound generator |
| [`family/`](family) | Worker, D1 migrations, React app, docs pages, all their tests |
| [`devpost/`](devpost) | plan-lens answers, the brief CLAD builds from, story, video script |
| [`docs/`](docs) | [PRD](docs/01-PRD.md) · [design](docs/02-DESIGN.md) · [architecture](docs/03-ARCHITECTURE.md) · [testing](docs/06-TESTING.md) · [research](docs/10-RESEARCH.md) |

</details>

<br>

<div align="center">

[Accessibility](ACCESSIBILITY.md) &nbsp;·&nbsp; [Security](SECURITY.md) &nbsp;·&nbsp; [Contributing](CONTRIBUTING.md) &nbsp;·&nbsp; [Code of conduct](CODE_OF_CONDUCT.md) &nbsp;·&nbsp; [Support](SUPPORT.md) &nbsp;·&nbsp; [Cite](CITATION.cff)

<br>

<a href="https://purna.dualmindlab.tech/play"><img src="docs/img/readme/outro.gif" width="100%" alt="Clay diyas light up across a dark table, the right side first, then the left. Text: Every diya, on both sides of the table. purna.dualmindlab.tech, try the table in your browser."></a>

<sub>Built by <a href="https://github.com/harshbhx">Harsh Bhanushali</a> for Learn AR with SPECS · MIT licence · <a href="mailto:harshbhx@gmail.com">harshbhx@gmail.com</a></sub>

</div>
