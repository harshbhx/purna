# 07 — Submission

Everything Devpost asks for, where it lives, and the last checks. Deadline: Mon 7 Dec 17:00 ET = **Tue 8 Dec 03:30 IST**. Our target: submit **Mon 7 Dec 22:00 IST**.

Source: [learn-specs.devpost.com/rules](https://learn-specs.devpost.com/rules).

## 1. Video

Script, chapters, YouTube title and description: [`devpost/VIDEO.md`](../devpost/VIDEO.md).

- [ ] Under 3:00 (target 2:45)
- [ ] Shows the Lens running in the **Lens Studio preview** (at least 60 s on screen)
- [ ] No copyrighted music, no third-party trademarks beyond naming the tools
- [ ] Public on YouTube; captions uploaded; link on the Devpost form

## 2. Devpost text

Paste-ready: [`devpost/STORY.md`](../devpost/STORY.md). Fill every **[after CLAD]** line with real results, then delete the markers.

- [ ] Tagline, elevator pitch, story, built-with tags
- [ ] LEAF results in "How we built it"
- [ ] Testing instructions for judges
- [ ] Every number matches the README and CI (tests 200; bench numbers from `docs/img/bench.svg`)

## 3. Repository

- [ ] Public: github.com/harshbhx/purna, default branch `main`
- [ ] Lens Studio project files committed (`purna.esproj`, `Assets/`, `.meta` files)
- [ ] `devpost/` holds the skill pack's planning documents (`plan-lens-answers.md`, `design-brief.md`) plus the story and video script
- [ ] README "Status, honestly" table updated with LEAF results; GIFs from the Lens preview added

## 4. Disclosures

In `devpost/STORY.md` § Disclosures: AI coding assistants (Claude, CLAD), React Bits, shadcn/ui and Radix, Aceternity-style effects, Mukta and Geist fonts, sounds. Add anything else pre-existing that went into the Lens.

## 5. Final checks (Mon 7 Dec)

- [ ] CI green on `main`; https://purna.dualmindlab.tech is live and "See an example" works logged out
- [ ] The Lens opens and runs in a clean Lens Studio install from a fresh clone
- [ ] Judge simulation done (`06-TESTING.md` §7): someone new can say who it's for, the moment, why glasses, whether it works, and its limits
- [ ] Devpost form: repo URL, video URL, text, tags, team, submitted
