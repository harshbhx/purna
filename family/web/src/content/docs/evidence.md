# Evidence and limits

Why Purna is built the way it is, what the research says, and what we don't know yet. Every row below links to a source we opened and read; the longer notes are in the [research document](https://github.com/harshbhx/purna/blob/main/docs/10-RESEARCH.md).

## The problem in brief

Spatial neglect is common after a stroke on the right side of the brain: people stop attending to the left side of space, eat from one side of the plate, miss words on the left of a page and bump into the left door frame, usually without knowing it. Their eyes work; their attention doesn't reach the left. Therapists train it with scanning exercises and paper **cancellation** sheets, but these happen in a clinic, on paper, and can't see where the head turns. In many places people get little therapy after a stroke at all.

| Finding | Source |
|---|---|
| Neglect follows roughly 40% of right-hemisphere strokes and about 20% of left-hemisphere strokes | [UEA review](https://ueaeprints.uea.ac.uk/id/eprint/78250/1/Accepted_Manuscript.pdf) |
| Daily life breaks on the affected side: food left on the plate, words missed, the door frame bumped; families are upset when the person doesn't look at them | [StrokEngine](https://strokengine.ca/en/?p=3486) |
| People unaware of their deficit struggle with strategy training; awareness problems and neglect often occur together | [Kortte & Hillis](https://pmc.ncbi.nlm.nih.gov/articles/PMC3039433) |
| In a multicentre study in India, 76% of stroke survivors got physiotherapy and only 7.6% occupational therapy, the discipline that usually treats neglect | [INSPIRE](https://pubmed.ncbi.nlm.nih.gov/37114983/) |

## What the therapy research says

| Finding | Source | What Purna does with it |
|---|---|---|
| Visual scanning training improves visual scanning | [NCBI Bookshelf](https://www.ncbi.nlm.nih.gov/books/NBK585577/) | The core task is a scanning search |
| Whether neglect therapies improve independence in daily life is very uncertain | [Cochrane review](https://pmc.ncbi.nlm.nih.gov/articles/PMC8247630/) | Purna says "practice", never "treatment", and every result says "not a diagnosis" |
| Showing patients where they looked during search improved neglect and self-awareness more than usual occupational therapy in a crossover study | [Kobe University thesis](https://da.lib.kobe-u.ac.jp/da/kernel/D1008330/D1008330.pdf) | The replay and the attention map |
| Leftward smooth pursuit reduces neglect; rightward may make it worse | [VR eye-movement training review](https://www.elsevier.es/es-revista-international-journal-clinical-health-psychology-355-articulo-virtual-reality-eye-movement-training-S1697260025000870) | The warm-up only ever moves left, and a test fails the build if that changes |
| Optokinetic stimulation on a see-through head-mounted display improved hemispatial neglect | [Choi et al. 2015](https://pmc.ncbi.nlm.nih.gov/articles/PMC4678567) | The closest precedent for using glasses |
| Home visuomotor training: two supervised sessions, then ten self-run sessions | [Rossit et al. 2017](https://research-portal.uea.ac.uk/en/publications/efficacy-of-home-based-visuomotor-feedback-training-in-stroke-pat/) | The therapist can run the first session; the patient practises at home |
| Survivors, carers and clinicians were positive about self-administered VR telerehabilitation for neglect | [UEA end-user study](https://ueaeprints.uea.ac.uk/id/eprint/76987/1/Accepted_Manuscript.pdf) | Self-run sessions with a family site |
| Family-led rehabilitation in a large trial in India did not reduce death or dependency | [ATTEND, Lancet 2017](https://researchonline.lshtm.ac.uk/4052645) | The family watches and encourages; the therapist runs the therapy |

## How the measures are scored

| Finding | Source | In Purna |
|---|---|---|
| Targets with a gap on the left or right separate neglect of "my left" from neglect of "each object's left" | [Ota test](https://pmc.ncbi.nlm.nih.gov/articles/PMC3358702), [Apples Test](https://pmc.ncbi.nlm.nih.gov/articles/PMC3486857/figure/pone-0047821-g001) | Whole and chipped diyas, with gaps on both sides |
| Centre of Cancellation summarises spatial bias; an acute value above 0.081 on the Bells Test indicated neglect, not validated for chronic patients | [Rorden & Karnath 2010](https://pmc.ncbi.nlm.nih.gov/articles/PMC3129646) | On every report; the paper value is shown only as context |
| Fixed cut-offs give false positives that depend on how many targets were found | [J Int Neuropsychol Soc 2020](https://www.psy.ox.ac.uk/publications/1098321) | No pass/fail line; watch change over weeks |
| Search organisation (order, crossings) is a useful measure beyond counts | [CancellationTools](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4636511/) | Search order, path crossings, revisits |
| Neglect can be worse in far space than near space | [Guilbert et al. 2024](https://hal-universite-paris-saclay.archives-ouvertes.fr/LISN/hal-04356042) | A far board 2 m away (add-on) |

## Safety findings that shaped the design

| Finding | Source | In Purna |
|---|---|---|
| Content shouldn't flash more than three times a second | [W3C, WCAG 2.3.1](https://www.w3.org/WAI/WCAG20/Understanding/three-flashes-or-below-threshold) | Nothing in the Lens changes brightness faster |
| About 10% of people develop epilepsy after a stroke | [Nandan et al. 2023](https://doaj.org/article/61eb6837ea194f9a896517436d04e9a0) | Why the flash limit and the seizure warning matter |
| Snap asks people prone to seizures or with serious conditions to consult a doctor first, and to use Spectacles in a clear space away from open flames | [Spectacles safety warnings](https://support.spectacles.com/hc/en-us/articles/26661227553300-Safety-Warnings) | The [safety guide](#safety) and the setup reminder |
| Spectacles are for people 18 and over | [Spectacles age restrictions](https://support.spectacles.com/hc/en-us/articles/30247528956052-Age-Restrictions) | Adults only |

## What we've checked ourselves

The numbers are on [Results so far](#results). In short: Purna's measures separate three simulated search styles on 200 layouts each, the software runs 286 automated tests on every change, and the family site passes automated accessibility checks on every screen.

## What isn't known

- **Whether neglect training improves daily life.** The evidence is very uncertain, so Purna claims nothing about it.
- **How Purna feels to a stroke survivor:** comfort over four minutes, pinch accuracy with a weaker hand, whether the bell's direction is clear on real glasses.
- **Whether Purna's measures agree with standard assessments** such as the Bells Test, the Apples Test or the Catherine Bergego Scale. That needs a study with patients and clinicians.
- **Whether head direction is a good stand-in for gaze.** People can look left with their eyes alone.

## What would come next

1. Feedback from therapists on the measures and the reports.
2. A small, ethics-approved pilot: a few supervised sessions, then home use, alongside standard tests.
3. Comparing Purna's numbers with standard assessments, then more languages on the glasses.

If you're a clinician and would like to help, see [Guide for therapists](#therapists) or write to [harshbhx@gmail.com](mailto:harshbhx@gmail.com).

Last reviewed: 28 November 2026.
