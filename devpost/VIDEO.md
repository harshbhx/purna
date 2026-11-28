# Purna: demo video and YouTube page

Rules this follows (learn-specs.devpost.com/rules): **under 3:00** (judges may stop at 3:00), public on **YouTube**, includes a **screen recording of the Lens running in the Lens Studio preview**, no third-party trademarks or copyrighted music without permission, in English.

Target length **2:45**. Harsh records the voice. Footage: Lens Studio preview (recorded with `PurnaDemoDirector` for the hands-free main take), the family site, the GitHub CI page.

---

## YouTube

**Title (under 70 characters)**

Purna: lighting lamps to find the left side after a stroke (Snap SPECS)

**Description**

```
After a stroke on the right side of the brain, many people stop noticing the left half of the world. It's called left spatial neglect. Purna is a Snap SPECS Lens that turns the therapist's paper exercise into lighting clay diyas on your own dining table.

Light the whole diyas, leave the chipped ones. Stuck on the right? A temple bell rings from the left. It points to the side, never to the answer. When you finish, a glowing thread replays your own search, so the half you skipped becomes visible. One pinch sends the session to the family, and a 7-day link gives the therapist every number.

Built for Learn AR with SPECS (Round 2), planned with the Devpost skill pack and built with CLAD, Lens Studio and the Lens Studio MCP.

0:00 The problem: half the world goes quiet
0:22 A session at the table
0:58 The hint from the left
1:20 The replay: seeing your own search
1:38 Report and send to family
1:52 Purna Family: what the family and therapist see
2:16 How it's built and tested
2:36 Honest limits

Try the family site: https://purna.dualmindlab.tech
Code, research and tests: https://github.com/harshbhx/purna

Purna is a practice tool, not a medical device. It doesn't diagnose or treat. Every session shown is from simulated players, not patients.
```

**Tags**

snap spectacles, specs, lens studio, ar, augmented reality, stroke, stroke rehabilitation, spatial neglect, hemispatial neglect, occupational therapy, accessibility, cloudflare workers, devpost, learn ar with specs

**Thumbnail**

The night-table frame from the site's hero (dark table, right half lit, left half dark) with two words on the left in large type: **"Look left."** No logos other than Purna's.

**Visibility:** Public. **Category:** Science & Technology. **Made for kids:** No. Captions: upload the script below as an `.srt` so the video works muted.

---

## Script (2:45)

Voice is calm and slow, like explaining to a family. Music: none, or a soft original drone made in-house. The only sounds are Purna's own: the light tone, the tick, the bell.

| Time | Picture | Voice |
|---|---|---|
| 0:00 | Black. A single diya lights in the dark. | After a stroke on the right side of the brain, many people stop noticing the left half of the world. |
| 0:07 | Site hero: the night table, right half lighting, left half dark. | They eat half the plate. Read half the page. And usually, they don't know it. It's called left spatial neglect. |
| 0:15 | Text on screen: "7.6% got occupational therapy" (INSPIRE). Paper cancellation sheet, a hand crossing out targets. | Therapists train it with paper sheets in the clinic. But in one Indian study, only 7.6% of stroke survivors got therapy at all. |
| 0:22 | **Lens Studio preview.** Setup panel: Standard, Start. | Purna brings that exercise home, onto your own dining table, through Snap SPECS. |
| 0:30 | Diyas appear across the table, whole and chipped. | Small clay diyas appear. Light the whole ones with a pinch. Leave the chipped ones alone. |
| 0:40 | Pinches on the right: flame, warm tone. A chipped one: tick, nothing lights. | No score. No timer. No failure sounds. Just lamps. |
| 0:50 | Right half all lit. Pause. The head stays right. | Ramesh lights the right half, and stops. He's sure he's done. |
| 0:58 | Bell from the left (let it ring, no voice for 2 s). Beam pulses on the left edge. | |
| 1:03 | The view turns left. The beam sweeps. | The bell comes from the left. It points to the side, never to the answer. The searching stays his. |
| 1:12 | Left diyas light one by one. The beam dims. | And as he starts finding the left on his own, the beam fades. |
| 1:20 | **The replay:** the thread draws through the lit diyas in order; missed ones pulse. | When the table is done, a thread replays his search. For the first time, he can see the half he skipped. |
| 1:30 | Close on the thread and the numbers. | Showing people where they looked improved neglect in a crossover study. Here it's on his own table. |
| 1:38 | Report card: four measures in plain words. Pinch "Send to family". Pairing code appears. | Four measures in plain words. Practice result, not a diagnosis. One pinch sends it home. |
| 1:52 | Phone: purna.dualmindlab.tech, type the code, the dashboard: card, bars, trend. | His family types the code once. Every session arrives as one sentence and a trend line, the left side coming back. |
| 2:04 | Desktop: share with doctor, the therapist view, table and replay. Note back. | The therapist gets a seven-day link with every number a cancellation test gives, and writes a note back. |
| 2:12 | "Three ways to search the same table": switch tabs, highlighted measures. | And the site explains what the numbers mean. |
| 2:16 | Code: `Assets/Scripts/Core`, then the bench chart, then GitHub Actions green. | Every rule is plain TypeScript, tested before Lens Studio opened. CLAD built the scene from our plan-lens brief, and LEAF checks each done criterion. |
| 2:26 | Bench chart close-up. | Three simulated searchers on two hundred tables prove the report tells left neglect from object neglect. 181 automated tests run on every change. |
| 2:36 | Back to the lit table, whole. Text: "Practice tool, not a medical device. Simulated players, not patients." | Purna is a practice tool, not a medical device, and it hasn't met a patient yet. That's next. |
| 2:43 | Logo: Purna पूर्ण. "purna.dualmindlab.tech". | Purna. Whole. |

**Before upload, check:** length under 3:00; the Lens Studio preview is on screen for at least 60 s; the bell is audible; no third-party logos except where required to name the tools; captions uploaded; description links work.

---

## Shot list for recording

1. **Lens Studio preview, main take** (`PurnaDemoDirector` on, seed 4127, Standard, 6 s hints): setup → table → right half → stuck → bell and pulse → sweep → left half → replay → report → Send to family → code. Record at 1080p. Turn the preview audio on.
2. **Preview close-ups:** a chipped-diya pinch (tick only); the beam dimming; the replay thread.
3. **Phone (390 px, Chrome device mode):** pair with the code, dashboard, open a session.
4. **Desktop (1440 px):** share with doctor, the therapist view, a note, "Three ways to search the same table".
5. **Code and CI:** `Assets/Scripts/Core` in the editor, `docs/img/bench.svg`, the GitHub Actions run list.
