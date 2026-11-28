# 10 — Research: why we built Purna this way

Every design choice in Purna traces back to a source. This file is the evidence behind the pitch, the README and the video. Keep it current (rules at the bottom).

Last updated: 28 Nov 2026 (Harsh + Claude).

---

## 1. The story in five lines

1. After a stroke, many people stop attending to the left half of space (spatial neglect). Their eyes work; their attention doesn't, and they usually don't know it.
2. Therapists train it with scanning exercises and paper cancellation sheets. These help scanning, but they're small, on paper, in a clinic, and blind to head movement.
3. In India most stroke survivors never reach that clinic: therapists are scarce and rehab is concentrated in cities.
4. Purna moves the proven exercise onto the patient's own table, on glasses whose narrow view turns "look left" into a physical head turn the Lens can measure.
5. It respects what the research says doesn't work (family as therapist, overclaiming) and what does (side cues not answers, leftward motion, feedback that builds awareness).

---

## 2. The problem

| # | Finding | Source | How Purna uses it |
|---|---|---|---|
| P1 | Neglect follows roughly 40% of right-hemisphere and 20% of left-hemisphere strokes | [UEA review](https://ueaeprints.uea.ac.uk/id/eprint/78250/1/Accepted_Manuscript.pdf) | Left side is the default; right-side mode is a later option |
| P2 | Daily life breaks on the affected side: food left on the plate, words missed, bumping the door frame; families are upset when the person doesn't look at them | [StrokEngine](https://strokengine.ca/en/?p=3486) | The thali/plate story in the pitch; the dining table as the setting |
| P3 | Patients who aren't aware of their deficit struggle with strategy training; awareness problems and neglect often occur together and worsen outcomes | [Kortte & Hillis](https://pmc.ncbi.nlm.nih.gov/articles/PMC3039433) | The replay: show him his own search instead of telling him |
| P4 | Fixation feedback (showing patients where they looked during search) improved neglect and self-awareness more than usual occupational therapy in a crossover study | [Kobe University thesis](https://da.lib.kobe-u.ac.jp/da/kernel/D1008330/D1008330.pdf) | Replay thread + missed diyas pulsing |

## 3. The India context

| # | Finding | Source | How Purna uses it |
|---|---|---|---|
| I1 | About 1.6 million people have a stroke in India each year; the vast majority get no formal rehabilitation | [ATTEND press release](https://www.eurekalert.org/news-releases/532285) | Home practice is the point |
| I2 | In a multicentre Indian study (INSPIRE), 76% got physiotherapy, 17% speech therapy and only 7.6% occupational therapy | [INSPIRE](https://pubmed.ncbi.nlm.nih.gov/37114983/) | Neglect is usually an OT problem, and OT is the scarcest; Purna extends the therapist between visits |
| I3 | India has about 1,000 physiatrists and 150 designated rehabilitation facilities | [WHO STARS review](https://bvbvf1.bib-bvb.de/vufind/PrimoRecord/cdi_proquest_journals_2921226767) | The doctor link lets one therapist follow many patients remotely |
| I4 | Neurorehabilitation in India lacks skilled professionals, has poor access and a rural-urban divide | [Gandhi et al. 2025](https://e-space.mmu.ac.uk/640396/1/Unmet%20needs%20of%20neurorehab_IRJ.pdf) | Same |
| I5 | **Family-led rehabilitation (ATTEND, 14 hospitals in India) did not reduce death or dependency**; the authors don't support shifting rehab tasks to family caregivers | [ATTEND, Lancet 2017](https://researchonline.lshtm.ac.uk/4052645) | Family role is visibility and encouragement; the therapist runs therapy |

## 4. What the therapy evidence says

| # | Finding | Source | How Purna uses it |
|---|---|---|---|
| E1 | Visual scanning training improves visual scanning | [NCBI Bookshelf](https://www.ncbi.nlm.nih.gov/books/NBK585577/) | The core task is scanning practice |
| E2 | Evidence that neglect interventions improve daily-life independence is very uncertain (Cochrane) | [Cochrane review](https://pmc.ncbi.nlm.nih.gov/articles/PMC8247630/) | Pitched as practice + measurement, never treatment; "not a diagnosis" line on the report |
| E3 | German neurology guidelines recommend active exploration and smooth pursuit training; leftward pursuit reduces neglect while rightward may worsen it | [VR eye-movement training review](https://www.elsevier.es/es-revista-international-journal-clinical-health-psychology-355-articulo-virtual-reality-eye-movement-training-S1697260025000870) | Drift moves leftward only, enforced by a unit test |
| E4 | Optokinetic stimulation projected onto a see-through head-mounted display improved hemispatial neglect | [Choi et al. 2015](https://pmc.ncbi.nlm.nih.gov/articles/PMC4678567) | The direct precedent for glasses |
| E5 | Home visuomotor training: 2 supervised sessions, then 10 self-run sessions over 2 weeks | [Rossit et al. 2017](https://research-portal.uea.ac.uk/en/publications/efficacy-of-home-based-visuomotor-feedback-training-in-stroke-pat/) | The therapist runs session 1; the patient self-runs after |
| E6 | Prism adaptation was delivered at home with help from caregivers and family | [Fortis et al. 2018](https://archive-ouverte.unige.ch/unige:114458) | The carer starts the session; therapy design stays the therapist's |
| E7 | Survivors, carers and clinicians were positive about self-administered VR telerehabilitation for neglect | [UEA end-user study](https://ueaeprints.uea.ac.uk/id/eprint/76987/1/Accepted_Manuscript.pdf) | Supports self-run sessions and Purna Family |
| E8 | Home-based computerised neglect therapy (c-SIGHT) is being trialled as telerehabilitation | [NCT04752982](https://clinicaltrials.gov/study/NCT04752982) | Home neglect therapy is an active research direction |

## 5. How Purna measures

| # | Finding | Source | How Purna uses it |
|---|---|---|---|
| M1 | The Ota test separates egocentric (your left) from allocentric (each object's left) neglect using shapes with a gap on the left or right | [Ota et al. via PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3358702) | Whole vs chipped diyas, chips on both sides |
| M2 | The Apples test scores egocentric asymmetry from targets missed by side and allocentric asymmetry from false positives by gap side | [Apples test](https://pmc.ncbi.nlm.nih.gov/articles/PMC3486857/figure/pone-0047821-g001), [scoring](https://pmc.ncbi.nlm.nih.gov/articles/PMC6487998/figure/fig3) | Report tiles 1 and 2 |
| M3 | Paper tests only assess near space; neglect can be worse in far space | [Guilbert et al. 2024](https://hal-universite-paris-saclay.archives-ouvertes.fr/LISN/hal-04356042) | Far board at 2 m (add-on) |
| M4 | Search organisation (order, crossings) is a useful measure of multi-target search beyond counts | [CancellationTools](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4636511/) | Search-order score, path crossings, revisits |
| M5 | A VR cancellation task correlated with paper tests; Centre of Cancellation summarises spatial bias | [VR cancellation pilot](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7263018/) | Centre of Cancellation on the report |
| M6 | VR batteries can test near and far space | [EPFL](https://link.springer.com/article/10.1186/s12984-023-01156-1) | Far board design |
| M7 | An acute Centre of Cancellation above 0.081 on the Bells Test (0.083 on Letter Cancellation) indicated neglect after right-hemisphere stroke; not validated for chronic patients | [Rorden & Karnath 2010](https://pmc.ncbi.nlm.nih.gov/articles/PMC3129646) | The dashed reference line in the therapist view, labelled as paper-test context only |
| M8 | Fixed cut-offs give false positives that depend on how many targets were cancelled: 10–30% for left-right difference scores and 10–90% for Centre of Cancellation | [J Int Neuropsychol Soc 2020](https://www.psy.ox.ac.uk/publications/1098321) | Why Purna shows references as context, never as a pass/fail line, and watches change over time |
| M9 | The Apples Test has standardised cut-offs for its egocentric and allocentric asymmetry scores (Italian norms: omission difference ≥ 3 and commission difference ≥ 2 are pathological), specific to that test | [Mancuso et al. 2015, Neurol Sci](https://iris.uniroma1.it/bitstream/11573/780999/1/Mancuso_Italian_2015.pdf) | The therapist view says those cut-offs don't carry over to Purna's 12 + 12 diyas |

## 6. Prior art (credit it)

| # | What | Source | How Purna differs |
|---|---|---|---|
| A1 | **Negami**: tablet AR app for neglect; patients rated it well on motivation, satisfaction and fun; tested in a randomised trial | [JMIR Serious Games 2023](https://games.jmir.org/2023/1/e40651), [RCT](https://homepage.uni-tuebingen.de/karnath/pdfs_Pub/Stammler%20et%20al_Arch%20Phys%20Med%20Rehabil_2023.pdf) | Purna is hands-free and head-worn; the head turn is the exercise and a measurement |
| A2 | VR neglect batteries and VR telerehab | E7, M5, M6 | VR hides the real home; Purna uses the real table |
| A3 | Halo (Harsh, 2nd place, Build With AI: Basics) | [devpost.com/software/halo-az5yd4](https://devpost.com/software/halo-az5yd4) | Same values: an invisible disability, honest uncertainty, "a wrong hint is worse than no hint". Face recognition is out of scope here, so Halo itself wasn't ported |

## 7. Platform and privacy facts that shaped the design

| # | Fact | Source | Effect |
|---|---|---|---|
| S1 | Fetch works in the preview only with Device Type Override = Spectacles | [Snap: Internet Access](https://developers.snap.com/spectacles/about-spectacles-features/apis/internet-access) | Send to family can be demoed; Logger fallback |
| S2 | Using the internet disables access to camera frames, location and audio in that Lens | same | Purna needs none of them |
| S3 | Processed data (hand joints, surfaces) is not counted as camera use | [Snap: Permissions](https://developers.snap.com/spectacles/permission-privacy/overview?lang=en-US) | Pinch + internet is allowed |
| S4 | Snap Cloud (Supabase) is in alpha with case-by-case access | [Snap Cloud overview](https://developers.snap.com/spectacles/about-spectacles-features/snap-cloud/overview) | Purna Family runs on Cloudflare |
| S5 | DPDP Act consent must be free, informed, specific, unambiguous and withdrawable | [K&S summary](https://ksandk.com/data-protection-and-data-privacy/data-privacy-compliance-healthcare-healthtech/) | Sharing off by default; delete-all; expiring doctor links |
| S6 | Content should not flash more than three times in any one second (WCAG 2.3.1, the photosensitive-seizure limit) | [W3C, Understanding SC 2.3.1](https://www.w3.org/WAI/WCAG20/Understanding/three-flashes-or-below-threshold) | Nothing in the Lens changes brightness more than three times a second; the drift glow is a smooth 1 Hz |
| S7 | A meta-analysis of 128 studies found post-stroke early seizures in about 7% and post-stroke epilepsy in about 10% of people | [Nandan et al. 2023, J Int Med Res](https://doaj.org/article/61eb6837ea194f9a896517436d04e9a0) | Why the flash limit and the seizure warning matter more than usual for Purna's users |
| S8 | Snap: consult a doctor before using Spectacles if prone to seizures or with a serious medical, vision or psychiatric condition; stop at dizziness, nausea, eye strain; take regular breaks; use in a safe space clear of obstacles and open flames; keep away from medical implants | [Spectacles '24 safety warnings](https://support.spectacles.com/hc/en-us/articles/26661227553300-Safety-Warnings-Spectacles-24) | The safety page, the setup-panel reminder, and "talk to your doctor first" |
| S9 | Spectacles are for users 18 and over | [Spectacles: Age Restrictions](https://support.spectacles.com/hc/en-us/articles/30247528956052-Age-Restrictions) | Purna is for adults only; the privacy page says it isn't for children |
| S10 | India's DPDP Rules were notified on 14 Nov 2025 with an 18-month phase-in; people can ask for access, correction and erasure and nominate someone; requests must be handled within 90 days; breaches must be reported to the people affected | [PIB explainer, Nov 2025](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf) | The privacy page's rights and response times |
| S11 | 112 is India's single emergency number for police, fire and health; it can be reached by call, a 3-press power-button panic call, or the 112 India app | [112.gov.in](https://112.gov.in/) | One of the example numbers in the docs' emergency guidance, alongside 911, 999 and 000, which tells everyone to call their local emergency number |

---

## 8. Using this in the pitch

- **README:** a "Why" section from §1 plus the research table (P1, I1, I2, I5, E2, E3, M1, A1). Every claim links to its row here.
- **Video (0:00–0:30):** P2 (the plate), I1/I2 (no clinic), then the Halo line (A3).
- **Devpost "What we learned":** I5 (why family isn't the therapist), E2 (why we don't claim cures), E3 (why Drift only moves left).
- **Judge questions you should be ready for:**
  - "Does this work?" → E1 + E2: scanning practice improves scanning; daily-life effects are uncertain, so we measure and let therapists decide.
  - "Hasn't this been done?" → A1: on a tablet, yes, and it was well liked. Glasses make the head turn the exercise.
  - "Why not just the family?" → I5.

## 9. Rules for keeping this file current

1. Add a row only after opening the source; never cite a search snippet. Paraphrase, don't paste.
2. Every new design decision in `08-DECISIONS.md` that rests on evidence gets a row here, and the decision links to it.
3. If a source contradicts a claim we make, change the claim, then note it here with the date.
4. Bump "Last updated" when you edit.
