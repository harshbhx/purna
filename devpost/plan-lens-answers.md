# Purna: plan-lens answers (Harsh's versions)

Written by Harsh Bhanushali, 28 Nov 2026, for the `plan-lens` interview (Devpost Learn skill pack). These are the answers `devpost/design-brief.md` was written from.

**Changes after review (28 Nov):**
1. View width corrected: SPECS show about 37° tall by 32° wide (not 37° wide). The head-turn conclusion holds.
2. Done criterion 5 no longer depends on the internet: with no network, the same data prints to the Logger, and LEAF checks that path plus a fake endpoint.
3. Hard level: diyas are 5 cm (default) so 7 cm spacing still leaves 2 cm between them.
4. Replay covers the table only (default). The far board gets its own left/right numbers on the report.

---

## 1. The idea

Purna is a practice Lens for people who have had a stroke and now miss the left half of their world. Doctors call it spatial neglect. Their eyes work fine. The brain just stops paying attention to the left, so they eat the right half of the plate and leave the rest, shave half a face, or walk into the left side of a doorway. The hardest part is that they usually don't notice. To them, the right half is the whole thing.

Therapists already train this. The classic exercise is a paper sheet covered in little stars and shapes, and the patient crosses out every star. It works on the scanning skill, but it is paper, it is small, it is done in a clinic, and it says nothing about how the person moves their head. Most stroke survivors in India never get to that clinic anyway.

Purna takes that same exercise and puts it on the patient's own dining table. Small clay diyas appear across the table. Some are whole, some have a piece missing. The job is simple: light every whole diya, and leave the chipped ones alone. Whole diyas test whether you search the left side of the table. Chipped diyas test whether you notice the left side of each object. One small task checks both kinds of neglect.

It is built for three people:
- **The patient**, practising at home between therapy visits, on a table they eat at every day.
- **The family member** who sets it up, presses Start and sits beside them. Usually a son, daughter or spouse.
- **The therapist**, who reads the numbers afterwards and decides what to do next. Purna extends their reach; it doesn't replace them.

The name Purna means "whole" in Sanskrit and Hindi. That is the whole point of the Lens: helping someone make their world whole again, one diya at a time. The diya was a deliberate choice too. Lighting a lamp is something almost every Indian family does, so the task feels like a familiar ritual, not a test.

## 2. The spatial moment

Ramesh is 64. He had a stroke on the right side of his brain in March. It's a quiet Sunday morning, the breakfast plates are cleared, and his daughter Priya has put the SPECS on him and pressed Start.

Small clay diyas appear across the dining table in front of him. Some are whole, some have a corner broken off. He starts lighting the whole ones on his right, pinch, pinch, pinch, each one catching a small warm flame with a soft tone. Then he stops. As far as he can tell, he's done. He looks up at Priya as if to say *finished*.

He isn't. Half the table is still dark. He just can't feel that it's there.

A few seconds pass. Then a soft temple-bell sound comes from his left, and a warm amber beam along the left edge of the table pulses gently. Nothing tells him which diya, or that he made a mistake. It just tells him: there's something over there. He turns his head left, and the dark diyas are sitting there, waiting. He lights them one by one.

When the last task ends, the table shows him something he has never been able to see: his own search. A glowing thread draws itself across the table, from diya to diya, in the exact order he lit them. It sweeps across the right, hesitates, and only later crawls left. The diyas he missed pulse softly. For the first time, he can see the half he skipped, and nobody had to argue with him about it.

**Why it has to be glasses, not a phone or a tablet:**
- **The narrow view is a feature, not a bug.** At the table, SPECS show about 45 cm across, and the table is 70 cm wide. The whole table never fits in view at once. To find every diya he has to turn his head left, and turning his head left is exactly the habit his therapist is trying to rebuild.
- **The Lens can measure that head turn.** Paper and tablets can only see where you tapped. Glasses know where you looked and how far you turned. That's a number no paper test gives the therapist.
- **His hands stay free.** No phone to hold, no tablet to prop up. Just a pinch in the air.
- **It happens on his real table.** Not a sheet of paper in a clinic, not a flat screen. The same table where, every day, he leaves food on the left side of his plate. Practice in the place where the problem actually lives.

## 3. Product or overlay

Purna is a **product**: a small trainer that sits on a real surface. It isn't an overlay on top of some object it has to recognise. It doesn't need to know it's looking at a dining table, a plate or a person. It just needs a flat surface in front of a seated person, and that keeps it simple, reliable and private.

What the real version would sense on glasses:
- The table surface, so the diyas sit flat on it at the right height and distance.
- The direction of his head, the yaw, so we know how far left he turned and when. This is one of the main measures, not a side detail.
- His pinch, which is the only input the task needs.

That's it. No camera frames, no microphone, no faces, no object recognition.

What stands in for those in the preview, so judges can see everything working:
- A virtual dining table at real size, 70 × 45 cm. It's clearly named `PreviewTable (stand-in)` and is hidden on real glasses, where the real table takes its place. I want nobody to mistake it for a feature; it's scaffolding.
- A virtual wall board 2 m away for the far-space task, labelled the same way (`PreviewBoard (stand-in)`). Paper tests only check near space, and neglect can be different further away, so the board is there to test that.
- Head turns come from mouse-look (right-drag) in the preview. For automated tests I'm adding a head-yaw override input, because LEAF may not be able to turn the preview camera. The tests set the yaw directly and check the scoring reacts correctly. Footlight used the same kind of pose override, and it's a big reason their tests were trustworthy.

Send to family:
- On real glasses, **Send to family** posts the session's numbers to the Purna Family web app.
- In the preview it posts too, with Device Type Override set to Spectacles, since that's what makes fetch work in the preview.
- If the network fails for any reason, the Lens prints the exact same session data to the Logger. That JSON can be pasted straight into the web app, so the demo never dies just because the Wi-Fi did.

## 4. Where things live

Ramesh is seated, looking down at the table and turning his head left and right. He never has to stand or walk. His head starts at the origin, looking straight ahead, and everything is placed relative to that, at sizes that match a real dining table and real clay diyas.

| Thing | Where | Size |
|---|---|---|
| Table (stand-in) | 65 cm ahead, 30 cm below eye level, flat | 70 × 45 cm |
| Diyas on the table | Spread across the table, half left of centre and half right. Never inside a 3 cm band on either side of the centre line, so every diya is clearly "left" or "right" | 6 cm wide, at least 8 cm apart |
| Anchor beam | Upright strip along the table's left edge | 2 cm wide, 25 cm tall, warm amber |
| Bell sound | Comes from the table's left edge (spatial audio) | – |
| Setup panel | 50 cm ahead, just above the table, facing him | 30 × 20 cm |
| Drift row (add-on) | A line of diyas floating across the middle of the table | 6 cm diyas |
| Far board (add-on) | Standing 2 m ahead at eye height | 200 × 90 cm, diyas 18 cm wide |
| Replay thread | Drawn on the table, joining the lit diyas | Thin glowing line |
| Report card | Lying at the centre of the table, tilted toward him | 28 × 18 cm, four big tiles |

A few of these choices matter more than they look:
- The far-left diya sits about 28° off centre, and the view is only about 32° wide (37° tall), so about 16° each side. To see it at all, he needs to turn his head at least 12°. So the layout itself makes the head turn necessary, and measurable.
- The 3 cm empty band at the centre keeps the left-vs-right score honest. No diya sits on the line, where it would be unclear which side it counts for.
- The far-board diyas are 18 cm so they look the same size at 2 m as the 6 cm diyas do on the table. Only the distance changes, not the difficulty.
- Warm, bright colours everywhere. Black shows as transparent on the glasses, so the diyas, flames and beam are warm clay, gold and amber.

My diya-count choice: three difficulty levels on the setup panel, with Standard as the default.

| Level | Whole | Chipped | Diya size | Spacing | When to use it |
|---|---|---|---|---|---|
| Easy | 8 | 8 | 6 cm | 8 cm | First sessions, very tired days, or severe neglect |
| Standard (default) | 12 | 12 | 6 cm | 8 cm | Normal practice |
| Hard | 16 | 16 | 5 cm (default) | 7 cm | Once Standard feels easy and the beam has faded |

The earlier plan of 20 + 20 doesn't work. Forty diyas, each 6 cm wide and 8 cm apart, don't reliably fit on a 70 × 45 cm table once the centre band is kept clear. Twelve plus twelve fits comfortably, still gives six whole diyas per side (enough for a meaningful left-vs-right score), and keeps one task inside 90 seconds. The levels also give the therapist and family something to progress through over weeks, which makes it feel like training rather than a single test. Hard uses 5 cm diyas 7 cm apart, so there's still a clear 2 cm between neighbours for a shaky hand.

## 5. Hands

One hand, one gesture: pinch. After a stroke, one hand is often weaker, and many of our users are in their sixties or seventies, so anything fancier would be unfair to them. Everything also works with a mouse click in the preview, so judges can try the whole flow.

At the table, during the task:
- Pinch a **whole** diya → it lights with a small flame and a soft, warm tone. A tiny reward, every time.
- Pinch a **chipped** diya → a quiet, neutral tick and nothing else. No red flash, no error buzz. He isn't being told off; we're just quietly noting that he didn't see the missing piece on the left of that diya.
- Pinch a diya that's **already lit** → nothing visible happens. It's logged as a revisit, which is a useful clinical sign, but we don't make him feel bad about it.

The setup panel (the carer uses this, not the patient):
- Difficulty: Easy / Standard / Hard
- Hint delay: 4 / 6 / 10 seconds
- Beam starts on or off
- Drift warm-up on / off
- Far board on / off
- Share with family on / off, off by default
- A big Start button

The report card, at the end: three big buttons, **Replay**, **Send to family** (shown only if sharing is on) and **Done**.

The far board: he pinches from a distance using SIK's ray (far pinch), so he never has to get up or reach 2 m away.

Making it easy to hit: every target is 5 cm or bigger and highlights when aimed at, so a shaky or weaker hand can still tell what it's about to pinch before it commits.

What we're deliberately not using: no voice and no custom gestures. Stroke can affect speech, and custom gestures can't be shown in the preview anyway. Pinch is enough.

## 6. When things show

The rule behind all of this: during the task, show as little as possible. Every extra thing on screen is something that can pull his eyes to the right, and pulling his eyes right is the exact opposite of what we want.

**During a task:** only the diyas and the amber beam. No score, no timer, no text, no progress bar. Just the table.

**Hints only point to the side, never to the answer.** They escalate gently, and only while he's actually stuck:
1. **Hint 1:** 6 seconds with no diya lit, while at least one whole diya on the left is still dark → a soft bell from the left, and the beam pulses twice.
2. **Hint 2:** 6 more seconds with nothing → the beam sweeps slowly from the left edge to the centre and back, like a lighthouse.

Three rules keep the hints honest:
- **Never an arrow, glow or highlight on a particular diya.** If the hint shows him the answer, he learns to wait for the hint instead of learning to look left. We learned this the hard way with Halo: a hint that gives the answer is worse than no hint at all.
- **No hint once every whole diya on the left is lit**, even if some on the right are still dark. Right-side misses aren't the problem we're training, so we don't nag about them.
- **The beam fades as he improves.** It gets one step dimmer after every 4 left-side finds made without a hint, and one step brighter whenever a hint fires. He earns his way off the support, at his own pace.

**Drift (add-on):** diyas float only leftward, never rightward, because research shows leftward motion can help neglect and rightward motion can make it worse. A test enforces this.

**When a task ends:** when every whole diya is lit, or when time runs out. Drift gets 45 s, the table 90 s, the far board 60 s. The whole session takes about 4 minutes, short enough to do every day without getting tired.

**The replay, right after the last task:** the thread draws through the lit diyas on the table in the order he lit them, about 0.4 s per step, while the whole diyas he missed pulse softly. This is the most important moment in Purna. Many patients don't believe they're missing anything, and talking doesn't change that. Seeing your own path does. The replay covers the table only (default); the far board's results appear as its own numbers on the report.

**The report card, after the replay,** has four big tiles:
- **Left vs right:** how many whole diyas he found on each side.
- **Chipped-diya test:** whether he pinched chipped diyas, and which side their gap was on.
- **Search order:** how orderly the search was, plus path crossings and revisits.
- **Head turn:** how far left he actually turned.

Underneath, one honest line: *"Practice result, not a diagnosis. Share it with your therapist."*

**Out of view:** if something he needs is outside the narrow view, the bell from the left is the pointer. We don't need anything else.

## 7. Done criteria

Purna is done when a judge can open the preview, click around and see all five of these working. Each one is also covered by a LEAF test, with the head-yaw override wherever a head turn is needed.

1. **The table sets up correctly.** Press Start on Standard, and the table appears 65 cm ahead with 12 whole and 12 chipped diyas: 6 whole on each side of centre, chipped ones split evenly left and right, nothing inside the centre band, and the amber beam standing on the left edge.
2. **Pinches do the right thing.** Pinching a whole diya lights it with a flame and a tone. Pinching a chipped diya only ticks. Pinching a lit diya does nothing visible. All three are recorded in the session data with time and side.
3. **Hints fire only when they should.** After 6 s with nothing lit and a whole diya still dark on the left, the bell plays from the left and the beam pulses. After 6 s more, the beam sweeps. Once every left-side whole diya is lit, no hint fires, even if the right side isn't finished.
4. **The replay tells the truth.** When the task ends, the thread draws through the lit diyas in the exact order they were lit, and every missed whole diya pulses.
5. **The report reaches the right people.** The report card shows left vs right, the chipped-diya result, search order and head turn, and the full session data prints to the Logger. With sharing on, Send to family posts it to Purna Family and shows a short pairing code; if there's no network, the same data is in the Logger to paste into the app.

Add-on criteria, only if they get built:
- Drift diyas only ever move left. A test fails the build if any diya moves right.
- The far board gets its own left/right numbers on the report, separate from the table.

**The patient bench, as extra proof:** three scripted players (a healthy one, one with left neglect, one with object neglect) run the same session. The scores have to clearly separate them, or the measures aren't doing their job. It's clearly labelled as simulated.

## Consent, out of scope, risks and build order

### People and consent
Purna only ever works in the patient's own space, on their own table. It never sees anyone else. No camera frames, no audio, no faces, no names. The only thing that ever leaves the glasses is numbers: counts, times, angles, the order of lit diyas. Even those leave only after the carer has turned sharing on, and sharing is off by default.

On the Purna Family side, the doctor gets a read-only link that expires after 7 days, and the family can delete everything with one button. Health data is personal, and India's DPDP Act asks for clear consent, so we're treating privacy as a design rule, not a checkbox.

### Out of scope
- Recognising the real table. The preview uses the stand-in table. Real-surface placement is for later.
- Remembering sessions inside the Lens. Purna Family keeps the history; the Lens stays stateless.
- Diagnosis or any medical claim. Purna is practice plus measurement. It is not a medical device, and we never say it is.
- Right-side neglect mode. Rarer, and easy to add later as a setup option.
- Voice and custom gestures. Pinch only.

### Risks and open questions
- **Comfort and feel are unproven.** I don't yet know how comfortable four minutes of head turning is for an older patient, how accurate pinching is with a weaker hand, how clearly the bell's direction comes through the real SPECS speakers, or how accurate far-pinch is at 2 m. None of these can be fully tested without real users on real glasses.
- **LEAF may not be able to turn the preview camera.** That's why every head-turn test uses the yaw override. If LEAF can turn it after all, great, but nothing depends on it.
- **The evidence on daily life is honestly uncertain.** Scanning training clearly improves scanning, but whether it improves daily life is still debated (Cochrane). So we never claim Purna makes daily life better. We claim it gives people a way to practise at home and gives therapists real numbers.
- **Family role.** The ATTEND trial found family-led rehab didn't reduce dependency. So in Purna, family is there for visibility and encouragement. The therapist still runs the therapy.

### Build order if time runs short
Each step stands on its own, so if the clock runs out, whatever is finished is still a working demo.
1. Table, diyas and pinch (criteria 1–2). The core. Without this, there's nothing.
2. Hints and beam (criterion 3). This is what makes it therapy, not a game.
3. Replay (criterion 4). The emotional heart of the demo.
4. Report, Logger and Send to family (criterion 5). Closes the loop to the therapist and family.
5. Drift warm-up (add-on).
6. Far board (add-on).

Steps 1–4 are the must-have. Drift and the far board are cut if I'm behind, no regrets.
