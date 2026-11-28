# Accessibility

Purna is for people after a stroke, and for their families and therapists, many of whom are older. Accessibility is part of whether it works at all, not a feature on top. This page says what we check, what we know isn't good enough yet, and how to tell us.

> [!NOTE]
> The same statement, in plain words for families, is on the site: [purna.dualmindlab.tech/docs#accessibility](https://purna.dualmindlab.tech/docs#accessibility).

## Purna Family (the website)

**Target:** [WCAG 2.1](https://www.w3.org/TR/WCAG21/) level AA.

**How we check it, on every pull request** (`family/e2e`, real Chrome on a phone and a desktop size):

| Check | How |
|---|---|
| Automated WCAG 2.1 A and AA rules | [axe-core](https://github.com/dequelabs/axe-core) scans every screen and every dialog, in **light and dark** mode (`e2e/a11y.spec.ts`) |
| Keyboard only | A test walks the site with the keyboard: the skip link, tabs with arrow keys, dialogs that open with Enter, close with Escape and give focus back (`e2e/keyboard.spec.ts`) |
| Reflow | No sideways scrolling from 320 px to 1440 px wide |
| Reduced motion | With `prefers-reduced-motion`, the night table shows the whole table at once and nothing animates |
| Language | The family's own screens switch to Hindi, with `lang` set so screen readers pronounce them; the dashboard stays usable and axe-clean in Hindi |

**What's in place:** a skip link on every page; visible focus; labels on every input; charts and replays have text equivalents (each replay describes what was found and missed, and how long the head pointed left); tables that scroll sideways are focusable regions; links in text are underlined; no meaning carried by colour alone (left and right also differ by line style); a light/dark switch in every header that remembers your choice; no cookies and no sign-up forms.

**The browser table (`/play`)** is a visual search task by design, so it can't be fully equivalent without sight. Everything in it works from the keyboard: arrow keys turn the head, Tab moves between the diyas in view, Enter lights one. Each diya has a name ("Whole diya", "Chipped diya, gap on the left"), the bell is also shown as a caption and announced to screen readers, and the result is a text report.

## The Lens (on the glasses)

| What | Why |
|---|---|
| Every diya can be pinched with a ray from a hand resting in the lap | A right-hemisphere stroke often weakens the left arm; lighting a left diya must never mean reaching across the body |
| **Look to light** (add-on): hold the head on a diya for 1.5 s to light it | For people who can't pinch |
| Hints are both sound (a bell from the left) and light (a beam on the left edge) | Works with hearing loss or with the sound off |
| Nothing changes brightness more than three times a second | WCAG 2.3.1; about 1 in 10 stroke survivors develops epilepsy |
| No reading needed during the task; no score, timer or failure sound | Stroke can affect reading and mood; the task should feel like lighting lamps, not a test |
| Big targets (diyas ≥ 5 cm, buttons ≥ 4 cm tall), warm bright colours | The display is additive: dark colours vanish |

## Known gaps

- **Nobody with neglect has used Purna yet.** Automated checks can't tell us whether it's comfortable or clear for a stroke survivor. That needs sessions with real people and their therapists.
- The Lens itself is only Hindi-ready on the website side; the glasses' text is English for now.
- Automated tools find roughly a third to a half of accessibility problems. We'd rather hear about the rest than guess.

## Tell us

Open an [accessibility issue](https://github.com/harshbhx/purna/issues/new?template=accessibility.yml), or email **harsh@dualmindlab.tech**. Say what you were trying to do, what got in the way, and what you use (screen reader, magnifier, keyboard, switch, voice). We aim to reply within 3 days.
