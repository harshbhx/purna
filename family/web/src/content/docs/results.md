# Results so far

What we've tested, how, and the numbers. Nothing here comes from patients yet: these results show that the software works and that its measures behave as intended, not that Purna helps anyone.

> **Simulated players, not patients.** The patient bench uses scripted searchers that play the real Purna engine. It shows that the measures separate search styles; it says nothing about real people.

## The patient bench

Three scripted searchers each played the real engine on the same 200 table layouts (Standard level: 12 whole and 12 chipped diyas):

- **Healthy:** searches the whole table, row by row, and turns the head toward each diya.
- **Left neglect:** doesn't attend past 12 cm left of centre unless a hint just fired, and even then not past 22 cm; turns the head left at most 8° unless cued.
- **Object neglect:** searches like the healthy player but treats diyas with the gap on their left as whole, and lights them.

| Average over 200 layouts | Healthy | Left neglect | Object neglect |
|---|---|---|---|
| Left diyas found | 100% | 64.8% | 100% |
| Hints needed per session | 0 | 2.92 | 0.01 |
| Centre of Cancellation | 0.000 | 0.198 | 0.000 |
| Egocentric asymmetry | 0.000 | 0.223 | 0.000 |
| Chipped-on-left diyas lit | 0 | 0 | 5.63 |
| Furthest head turn left | 27.1° | 16.4° | 28.9° |
| Time the head pointed at the left half of the table | 49.9% | 4.4% | 51.9% |
| Layouts where at least one left diya was missed | 0 of 200 | 196 of 200 | 0 of 200 |

![Bar charts over 200 simulated sessions per player. Left diyas found: healthy 100%, left neglect 65%, object neglect 100%. Hints needed: 0, 2.9, 0. Chipped-on-left diyas lit: 0, 0, 5.6. Head turned left: 27°, 16°, 29°.](/img/bench.svg)

**What it shows:** the left-neglect searcher stands out on left diyas found, hints, Centre of Cancellation, head turn and the attention map; the object-neglect searcher finds every diya but stands out on chipped diyas with a gap on the left. On 4 of 200 layouts the left-neglect searcher found every left diya thanks to the hints, and the hint count and head turn still gave it away.

The checks run on every change: for example, on every layout the left-neglect searcher's Centre of Cancellation is at least the healthy searcher's, it needs at least one hint, and it spends less time turned left.

## Automated tests

| Part | Tests | What they cover |
|---|---|---|
| The engine (the logic the glasses run) | 79 | Table layouts on 500 random seeds at every level, hint timing to the frame, beam fading, every measure, the attention map, the next-session choice, and each sound against its design. 99% of the engine's lines run under test |
| The server and database | 84 | Every route and error, field-by-field checks on every session, the engine-to-server contract over every level and add-on, rate limits, data clean-up, and the therapist's next-session plan |
| The website's components | 72 | Charts and replays, the family and therapist views, the browser table on the real engine, the docs, Hindi, light and dark |
| The website end to end | 51 on a phone and a desktop | Real Chrome against the real build: pairing, sharing with a doctor, notes, the next-session plan, deleting everything, the browser table, a keyboard-only walk |

Every change runs all 286 tests on GitHub before it can be merged, and the live site is checked after each release and once a day.

## Accessibility checks

- Automated WCAG 2.1 A and AA checks (axe) on every screen and dialog, in light and dark mode.
- A keyboard-only walk through the site.
- No sideways scrolling from 320 to 1440 pixels wide.
- Reduced motion respected everywhere.

See [Accessibility](#accessibility) for what these checks can't catch.

## Not tested yet

- Any session with a stroke survivor or a therapist.
- The Lens on real Spectacles (it's built and tested in Lens Studio's preview).
- Whether Purna's measures agree with standard assessments.

These are the next steps. See [Evidence and limits](#evidence).

Last reviewed: 28 November 2026.
