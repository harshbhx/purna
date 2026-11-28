# 08 — Live review (Thu 3 Dec, 22:30 IST)

A plan for the live review: what to have open, the order to show things, what to say, and what to do if something breaks. Keep it to the time you're given; the 2-minute version is the default.

## Before the call (by 22:00)

- [ ] Lens Studio open with the project, **Preview** running, Standard selected, `PurnaDemoDirector` off. Audio on.
- [ ] A browser with four tabs: [Try the table](https://purna.dualmindlab.tech/play) (headphones), [purna.dualmindlab.tech](https://purna.dualmindlab.tech), [the example therapist view](https://purna.dualmindlab.tech/doctor#demo), [the repo's JUDGES.md](https://github.com/harshbhx/purna/blob/main/JUDGES.md).
- [ ] The demo video file ready to play locally, in case the live preview misbehaves.
- [ ] Screen share tested; notifications off; the site checked live (it must answer, and **See an example** must work logged out).
- [ ] Water. Speak slowly.

## The 2-minute version

| Time | Show | Say |
|---|---|---|
| 0:00 | Site hero: the night table | "After a right-hemisphere stroke, many people stop noticing the left half of the world. Purna turns the therapist's paper exercise into lighting diyas on your own dining table." |
| 0:15 | **Lens Studio preview**: Start, light the right side | "Light the whole diyas, leave the chipped ones. No score, no timer, no failure sound." |
| 0:35 | Wait for the bell; turn left (right-drag) | "Stuck on the right? The bell rings from the left. It points to the side, never to the answer." |
| 0:55 | Finish; the replay | "The thread replays the search, so the half you skipped becomes visible. Showing people where they looked has helped in studies." |
| 1:10 | Report → Send to family → code | "Four measures in plain words, labelled practice, not diagnosis. One pinch sends it home." |
| 1:20 | Site: See an example; then the therapist tab | "The family sees one sentence and a trend. The therapist gets every number a cancellation test gives, with published references as context." |
| 1:40 | Home page: Three ways to search | "One table, three simulated searchers. This is how we know the measures separate left neglect from object neglect, before any patient." |
| 1:55 | Back to the preview, table lit | "Honest status: built and tested, not yet tried with patients. That's next." |

## The 5-minute version

Do the 2-minute version, then add:

1. **The engine** (1 min): `Assets/Scripts/Core` in the editor, then the GitHub Actions run list. "Every rule is plain TypeScript, tested before Lens Studio opened; CLAD built the scene against an engine that already worked. 200+ tests run on every change."
2. **The bench chart** (30 s): `docs/img/bench.svg`. "200 layouts per simulated player."
3. **Accessibility** (30 s): point out pinching with a ray from a resting hand ("a right-hemisphere stroke often weakens the left arm"), and "Look to light" if it was built.
4. **Privacy** (30 s): nothing identifying leaves the glasses; keys stored as hashes; doctor links expire; delete everything.
5. **Questions.**

## Likely questions, short answers

| Question | Answer |
|---|---|
| Why glasses, not a phone? | A phone shows the table through a small window held in the good hand, so the head never turns. On glasses the whole table is the canvas, hands are free, and head turn is measured. |
| Is this a medical device? | No. It's practice, labelled that way everywhere. The evidence that neglect training changes daily life is still uncertain, and we say so. |
| How do you know the measures are valid? | They follow published scoring (Centre of Cancellation; the Apples Test's asymmetries). On simulated players they separate three search styles on every seed. Validation with patients is the next step. |
| Why do hints only point to the side? | Because the searching is the exercise. Pointing at the diya would do the work for them. |
| What did CLAD build, and what did you write first? | We wrote and tested the logic in plain TypeScript first; CLAD built the scene, the interactions and the LEAF tests from the plan-lens brief, calling that engine. |
| What happens without internet? | The session prints to the Logger; the family can import it later. |
| What's next? | Sessions with therapists and stroke survivors, Hindi on the glasses (the family dashboard already has it), a far board across the room. |
| Biggest risk? | How it feels to an older person over four minutes, and whether the bell's direction is clear on real SPECS speakers. Both need real glasses. |

## If something breaks

- **Preview stalls or crashes:** say "Let me show you the recorded run", play the demo video from 0:22, and carry on with the site.
- **The site is down:** use the README's GIFs and the bench chart on GitHub; offer the local build afterwards.
- **No sound in the share:** say "the bell comes from the left edge here" and point; the beam still shows the cue.
- **You run out of time:** jump to the last line: what it does, the honest status, what's next.

## After the call

Write down every question you got and how you answered, and fold anything new into [`JUDGES.md`](../JUDGES.md) and the Devpost story before submitting.
