# 02 — Design

Purna should feel like lighting lamps at home, not taking a test. Warm, calm, quiet, and honest.

---

## 1. Principles (in priority order)

1. **Show as little as possible during a task.** Anything on screen can pull the eyes right.
2. **Point to the side, never the answer.** Bell and beam only. Nothing highlights a particular diya.
3. **No failure sounds.** Lit = warm tone. Chipped = neutral tick. Revisit = nothing.
4. **Warm and bright.** The display is additive: black is invisible. Clay, gold, amber, warm white.
5. **Big and forgiving.** Diyas ≥ 5 cm; buttons ≥ 4 cm tall; SIK hover highlight on.
6. **Seen, not told.** The replay is the message. Text is short and kind.

## 2. Spatial layout (seated, head at origin looking −z)

| Element | Position (cm) | Size (cm) | Faces |
|---|---|---|---|
| Table (stand-in) | centre (0, −30, −65), flat | 70 × 45 × 2 | up |
| Diyas | on the table top | 6 Ø × 3 high (Hard 5 Ø) | up |
| Beam | x = −35, centred on the table's depth, bottom on the table | 2 wide × 25 tall × 45 deep (a thin vertical sheet along the edge) | user |
| Hint speaker | (−35, −27, −65) | – | – |
| Setup panel | (0, −12, −50) | 30 × 20 | user, tilted 20° back |
| Report card | lying on the table at (0, −29, −62) | 28 × 18 | user, tilted 35° up toward the eyes |
| Far board (stand-in) | centre (0, 0, −200), upright | 200 × 90 | user |
| Far diyas | on the board face | 18 Ø | user |
| Drift row | u = 0 line across the table | 6 Ø | up |

At 65 cm the usable view is about 45 cm wide, so the setup panel, report card and the centre third of the table are in view with the head straight; the left and right thirds need a head turn. This is intentional.

## 3. Colour (Lens)

All values are display colours on an additive screen. Never below ~20% brightness for anything that must be seen.

| Token | Hex | Use |
|---|---|---|
| clay | `#E9A36B` | Diya body (unlit and lit) |
| clayRim | `#FFD9B0` | Diya rim highlight; chipped edge outline |
| flameCore | `#FFF4C9` | Flame centre |
| flame | `#FFB938` | Flame body, lit glow |
| beam | `#FFB347` | Beam at level 3 (opacity 0.9 / 0.6 / 0.35 / 0 for levels 3–0) |
| thread | `#FFD27A` | Replay thread, emissive |
| missed | `#FF9E5E` | Missed whole diya pulse (opacity 0.35 ↔ 0.9) |
| panel | `#F6EFE6` at 22% | UI Kit frame tint (light glass) |
| text | `#FFF8EE` | All text |
| textSoft | `#F3D9BD` | Secondary text |
| table | `#CFC6BA` at 35% | Stand-in table (matte, low contrast so diyas stay brightest) |

Chipped diyas: a clean wedge (about 70° of the rim) removed on the left or right side, with the cut edge outlined in `clayRim`. Readable at 65 cm; never shown as a dark patch.

## 4. Type (Lens)

UI Kit default font. Rule of thumb: body text at least 0.6° tall.
- At 50–65 cm: body 0.8 cm, labels 0.7 cm, tile numbers 1.6 cm, titles 1.2 cm.
- Max 8 words per line on the report card. Sentence case.

## 5. Motion

| Moment | Motion |
|---|---|
| Diya appears (task start) | Fade + rise 1 cm, 0.4 s, staggered 20 ms |
| Lit | Flame scales 0 → 1 over 0.25 s, then flickers (scale 0.95–1.05, 0.6 s loop, random phase) |
| Chipped pinch | Diya nudges down 3 mm and back, 0.15 s |
| Hint 1 | Beam opacity pulses twice (0.25 → 1 → 0.25, 0.6 s each), even if its level is 0 |
| Hint 2 | A bright band travels from the left edge to the centre and back over 3 s, ease in-out |
| Beam level change | 0.8 s fade |
| Drift | Constant 10 cm/s toward −x; flicker = flame on/off at 4 Hz for 2 s |
| Replay | Thread grows segment by segment, 0.4 s each, a small spark at the head; missed diyas pulse (1.2 s loop) |
| Report card | Fades in 0.5 s after the replay ends |

No camera shake, no flashes, nothing faster than 4 Hz.

## 6. Sound

The files are ready in `Assets/Audio/` (mono, 48 kHz, 16-bit WAV). They are original: synthesised from sine partials and seeded noise by `tools/scripts/sounds.ts` (`cd tools && npm run sounds`), so there is nothing to license, and a test checks each one against this table. Spatialise all except UI clicks.

| Sound | File | Character | Where |
|---|---|---|---|
| light | `light.wav` | Warm, soft tone (like a small brass bowl, 660 Hz), 0.4 s, 15 ms attack, −6 dBFS | At the diya |
| tick | `tick.wav` | Quiet wooden tick, 0.08 s, −14 dBFS | At the diya |
| bell | `bell.wav` | Soft temple bell over 784 Hz, one strike, about 40 dB down by 1.5 s, −3 dBFS | HintSpeaker at the table's left edge |
| ui | `ui.wav` | Soft click, 0.05 s, −16 dBFS | UI |
| replay | `replay.wav` | Very soft high shimmer per segment (optional), 0.35 s, −20 dBFS | Thread head |

No music. No error buzz ever.

## 7. Setup panel

Title "Purna", subtitle "Set up today's practice". Difficulty and Hint after arrive preselected from `suggestNext()` (Core `Next.ts`: two clean sessions in a row → a step harder, a hard session → a step easier), with its one-line reason in `textSoft` under them. Rows (UI Kit):
1. Difficulty: segmented Easy / **Standard** / Hard
2. Hint after: segmented 4 s / **6 s** / 10 s
3. Start with the beam: switch (on)
4. Warm-up: switch (off) *(hidden if Drift isn't built)*
5. Far board: switch (off) *(hidden if not built)*
6. Share with family: switch (off)
7. **Start** button, full width, 5 cm tall

## 8. Report card

```
┌──────────────────────────────────────────────┐
│  Left vs right        │  Chipped diyas        │
│  ███████░░ 9 / 12 L   │  Gap on left   2      │
│  █████████ 12 / 12 R  │  Gap on right  0      │
├───────────────────────┼───────────────────────┤
│  Search order         │  Head turn            │
│  Orderly 0.82         │  24° left             │
│  1 crossing · 0 revisits                      │
├──────────────────────────────────────────────┤
│ Practice result, not a diagnosis. Share it    │
│ with your therapist.                          │
│  [ Replay ]   [ Send to family ]   [ Done ]   │
└──────────────────────────────────────────────┘
```

If the far board ran, the Left vs right tile shows "Table" and "Board" rows. After Send: replace the Send button's label with "Sent to family ✓", or show the pairing code in large letters with "Ask your family to enter this code at purna.dualmindlab.tech".

## 9. Purna Family (web)

**Feel (redesign, 28 Nov):** a fresh, modern product look: white ground, ink-black main actions, Geist type, flame amber only for the diyas, orange = left side and blue = right side in data. The night table is the one bold element. Mockups: the Purna redesign canvas. Built with shadcn/ui, React Bits and Aceternity-style effects (`03-ARCHITECTURE.md` §6.5). The token table below is the original notebook palette, kept for the Lens-side colours' reference.

Original feel: a warm notebook, not a hospital dashboard. Mobile first (360 px), works to 1440 px.

| Token | Value |
|---|---|
| `--bg` | `#FBF6EF` (light), `#1C1814` (dark) |
| `--ink` | `#2A211A` / `#F4ECE2` |
| `--muted` | `#6E5E50` / `#BCA996` |
| `--accent` | `#C8651B` (saffron clay); text on accent `#FFFFFF` |
| `--good` | `#2F7D4F` |
| `--line` | `#E7DCCD` / `#3A322B` |
| radius | 14 px cards, 10 px buttons |
| font | system UI stack; numbers tabular |

Contrast: all text ≥ 4.5:1 on its background in both themes (check with a contrast tool before merging).

**Type:** Mukta (Ek Type, SIL OFL), self-hosted for the CSP, Latin and Devanagari so पूर्ण renders in the brand. 400 / 600 / 800 only.

**Screens**
1. **Home (logged out) = the landing page.** One bold element, everything else quiet:
   - **Hero, "the night table":** a dark wooden table (`#1d1511` / `#3a2a20`) with the real layout of a session. The right half's diyas light one by one, the left stays dark; a bell ripples from the left edge and the beam sweeps; then the left lights from the centre outward. Captions narrate each beat; "Play again" when done; reduced motion shows the whole table at once.
   - Then, as plain bands: the problem (half the plate, 7.6% OT access), the five steps of a session (numbered because they are a sequence) beside a real replay, **three ways to search the same table** (one layout played by the three bench searchers, tabs to switch, the measures that give each one away highlighted, a verdict sentence written from the numbers), what the family sees (a live session card + trend from the demo data), what the therapist gets (a live table), why it's built this way (four findings with sources), private by design, and the code form with "See an example".
   - No card grids, no all-caps labels, no arrow links, no scroll-triggered animations.
2. **Dashboard:** greeting ("Papa's practice"), nudge if > 3 days, newest session card on top (summary sentence + two mini bars), trend chart, list of earlier sessions, doctor notes, buttons: Share with doctor · Invite family · Import from Logger · Delete everything.
3. **Session detail:** the 2D replay (SVG, animates once, replay button), the four measures in plain words, technical numbers under "Details for the therapist".
4. **Doctor view:** header with expiry date, the glasses' next-session suggestion, progress tiles, table of sessions (date, preset, L/R found, CoC, ego/allo asymmetry, best r, crossings, revisits, hints, max left turn), trend with a day-to-day band (median session-to-session change around a 3-session rolling mean: "a change inside it may be chance"), "Where the time went" (seconds to find a diya per third, earliest vs latest, and time turned left), "Context from published tests" (the Bells Test CoC reference as a dashed line, Apples Test note, and why these are context, never a cut-off; `10-RESEARCH.md` M7–M9), notes box, Download CSV, Print. `/doctor#demo` shows the same view with the labelled demo sessions and notes switched off.

**Hindi:** the family's own screens (the dashboard, its dialogs, a session, and the sign-out, delete and join messages) switch to Hindi with a button in the header ("हिन्दी" / "English"), remembered on that device, with `lang` set on the page. Sentences built from numbers (the session summary, the measures, the nudge) are composed in Hindi word order in `lib/i18n.ts`, not translated word by word. The landing stays in English, and so does the therapist view, because therapists work in English. Server error messages are still English.

**Sharing and install:** the home page has Open Graph and Twitter preview tags with a 1200 × 630 image of the night table (left half dark), and a web manifest with maskable icons so families can add it to their home screen. The therapist and join pages are `noindex` and carry no preview.

**Accessibility:** WCAG 2.1 AA, checked with axe on every screen in both colour modes in CI. Skip link on every page; keyboard reachable with visible focus; dialogs give focus back to what opened them; tabs move with the arrow keys; tables that scroll sideways are focusable regions; labels on every input; charts have text equivalents; links in text are underlined; `prefers-reduced-motion` respected; no colour-only meaning. Below 1024 px the header folds into a menu.
