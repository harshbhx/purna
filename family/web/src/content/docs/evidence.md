# Evidence and limits

Why Purna is built the way it is, and what we don't know yet. The full notes, with every source, are in the [research document](https://github.com/harshbhx/purna/blob/main/docs/10-RESEARCH.md).

## The problem

- Spatial neglect follows roughly 40% of strokes on the right side of the brain. People miss food on the left of the plate, words on the left of the page, and bump into the left door frame, often without knowing it.
- Therapists train it with scanning exercises and paper "cancellation" sheets. These help scanning, but they happen in the clinic, on paper, and can't see where the head turns. Many people get little or no therapy after a stroke, and access varies widely between countries and between cities and rural areas.

## Why each design choice

| Choice | Because |
|---|---|
| Chipped diyas to ignore | Some people miss the left of the room, others the left of each object; targets with a gap on one side tell them apart (Ota test, Apples Test) |
| A replay of the search | People with neglect often don't know what they missed; showing patients where they looked improved neglect and self-awareness in a crossover study |
| Hints point to a side, never at a target | The searching is the exercise |
| Warm-up moves leftward only | Leftward smooth pursuit reduces neglect, while rightward may make it worse |
| Family sees results, the therapist runs therapy | In a large trial of family-led stroke rehabilitation, it didn't reduce death or dependency |
| No flashing | Seizures are a common complication after stroke; content shouldn't flash more than three times a second |

## What's known

- Scanning practice improves scanning.
- Purna's arithmetic separates three simulated search styles on every one of 200 layouts each.
- The software is tested: hundreds of automated tests run on every change.

## What isn't known

- **Whether neglect training improves daily life.** A Cochrane review found the evidence very uncertain. Purna says "practice", never "treatment".
- **How Purna feels to a stroke survivor:** comfort over four minutes, pinch accuracy with a weaker hand, whether the bell's direction is clear on real glasses.
- **Whether Purna's measures match standard assessments.** That needs a study with patients and clinicians.

## What would come next

Sessions with therapists and stroke survivors, with ethics approval; comparing Purna's measures with standard tests; and more languages.

Last reviewed: 28 November 2026.
