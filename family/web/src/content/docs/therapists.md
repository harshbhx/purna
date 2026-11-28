# Guide for therapists

Purna is a home practice tool built around a cancellation task, for patients with left spatial neglect whom you're already treating. It gives you visibility between visits. It does not replace your assessment or your therapy plan.

> **Not a diagnostic test.** The measures follow published cancellation-test scoring, but Purna's task has not been validated against standard assessments or tried with patients. Use it to watch change over time in someone you've already assessed.

## What the patient does

Seated at a table wearing Snap Spectacles, the patient sees 8, 12 or 16 whole clay diyas and the same number of chipped ones, split exactly half left and half right (Easy, Standard, Hard). They light the whole ones with a pinch and leave the chipped ones; chipped diyas have their gap on the left or the right. If no diya is lit for the hint delay (4, 6 or 10 s) while a left whole diya is still dark, a bell sounds from the left and a beam pulses on the left edge; after the same delay again, the beam sweeps. The beam dims as the patient finds left diyas without help. A table task lasts up to 90 s, then a replay shows their search path and missed targets.

## Suggested use

- **You choose the level and hint delay.** The glasses suggest a next step after each session (two clean sessions in a row → a step harder; under half of the left found with 3+ hints → a step easier), but the carer can change it, and your note can tell them to.
- Run the **first session with the patient yourself** if you can, so you can judge comfort, pinch accuracy and head movement.
- Agree how often the family should practise, and what should make them stop and call you.

## Opening the patient's results

The family sends you a **read-only link** from **Share with doctor**. It works for 7 days, or until they stop it. Nothing else is needed: no account, no login. You can try the view with example data at [purna.dualmindlab.tech/doctor#demo](https://purna.dualmindlab.tech/doctor#demo).

The view shows:
- **Progress tiles:** left side found, Centre of Cancellation and hints per session, first sessions vs latest.
- **Every session** in a table, with CSV download and a print layout.
- **The trend** with a band for this patient's usual day-to-day change (the median change between consecutive sessions), so a single good day isn't read as recovery.
- **Where the time went:** seconds to find a diya in the left, centre and right thirds, earliest vs latest, and the share of time the head was turned left.
- **Context from published tests** (see below).
- **Each session's replay.**
- **Where the head pointed:** each replay is painted with warm light where the head pointed during the table task, so a half that was never looked at stays dark.
- **Set the next session:** choose the level and the hint delay for the next session. The glasses load it on their setup panel once, with the line "Set by your therapist", and the family sees it on their dashboard. The carer can still change it on the day. Clear it to let the glasses suggest the next step themselves.
- **A note box:** your note appears on the family's dashboard. Up to 50 notes per link.

## The measures

See [What the numbers mean](#measures) for definitions and formulas. In short: left/right hits (egocentric), chipped diyas lit by gap side (allocentric), Centre of Cancellation, search organisation (best r, crossings, revisits), time per third, and head yaw.

## Published references: context, not cut-offs

On paper tests, an acute Centre of Cancellation above 0.081 on the Bells Test (0.083 on Letter Cancellation) indicated neglect after right-hemisphere stroke (Rorden & Karnath, 2010); those values were not validated for chronic patients. The Apples Test has its own standardised asymmetry cut-offs. **None of these carry over to Purna**: its table has far fewer targets, and with fixed cut-offs false positives rise when fewer targets are found. Watch the patient's own change over time instead.

## Limits to keep in mind

- **Visual field loss** (hemianopia) can also cause left omissions; Purna can't separate it from neglect.
- **Head yaw is not eye gaze.** Purna measures where the head points; patients can look left with their eyes alone.
- **Pinch errors:** a weak or imprecise pinch can light the wrong diya, which can look like an allocentric error. Check the replay.
- **Fatigue, attention and mood** affect a 90-second task; look at trends over weeks.
- **Few targets:** with 6 whole diyas a side on Standard, one miss moves the left score by about 17 points.

## Privacy, briefly

The glasses send no name, face, camera image or location; the family types the name they use. Your link is a random token stored only as a hash. Notes you write are kept with the family's data until they delete it. See [Privacy](#privacy).

## Help us improve it

We'd value your view on whether these measures are useful and what's missing: see [Report a problem](#report) for how to reach us. Clinical collaboration is welcome.

Sources: [Rorden & Karnath 2010](https://pmc.ncbi.nlm.nih.gov/articles/PMC3129646) · [Fixed cut-offs and false positives, J Int Neuropsychol Soc 2020](https://www.psy.ox.ac.uk/publications/1098321) · [Apples Test standardisation, Mancuso et al. 2015](https://iris.uniroma1.it/bitstream/11573/780999/1/Mancuso_Italian_2015.pdf) · [Full research notes](https://github.com/harshbhx/purna/blob/main/docs/10-RESEARCH.md)

Last reviewed: 28 November 2026.
