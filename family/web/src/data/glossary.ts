// The glossary: one list for the Glossary page and for every explained word on the site (components/purna/term.tsx).
// Each term has a stable slug (the link is /docs#glossary/<slug>), its name, a plain-language definition, and the words the
// docs use for it. In running text, the first use of a term on a page gets a dotted underline and a card with its meaning.
export interface GlossaryTerm { slug: string; name: string; short: string; aliases: string[] }

export const GLOSSARY: GlossaryTerm[] = [
  {
    "slug": "allocentric-neglect",
    "name": "Allocentric neglect",
    "short": "Missing the left side of each *object*, wherever it is. Also called object-centred neglect. Purna looks for it with chipped diyas.",
    "aliases": [
      "Allocentric neglect",
      "object-centred neglect",
      "allocentric"
    ]
  },
  {
    "slug": "allocentric-asymmetry",
    "name": "Allocentric asymmetry",
    "short": "Chipped diyas lit by mistake with the gap on the left, minus those with the gap on the right. Positive means the left of objects is being missed.",
    "aliases": [
      "Allocentric asymmetry"
    ]
  },
  {
    "slug": "anosognosia",
    "name": "Anosognosia",
    "short": "Not being aware of one's own difficulty. Common with neglect, which is why Purna *shows* the search instead of telling.",
    "aliases": [
      "Anosognosia",
      "unaware of their deficit"
    ]
  },
  {
    "slug": "apples-test",
    "name": "Apples Test",
    "short": "A paper cancellation test with whole apples and apples missing a bite on one side; it separates egocentric from allocentric neglect. Purna's chipped diyas follow the same idea.",
    "aliases": [
      "Apples Test",
      "Apples test"
    ]
  },
  {
    "slug": "attention-map",
    "name": "Attention map",
    "short": "Where the head pointed during the table task, shown as warm light across the table: brighter where it pointed longest. The side never looked at stays dark.",
    "aliases": [
      "Attention map",
      "attention map"
    ]
  },
  {
    "slug": "beam",
    "name": "Beam",
    "short": "A soft amber light along the table's left edge. It pulses with the bell, sweeps if someone stays stuck, and fades as they need it less.",
    "aliases": [
      "Beam"
    ]
  },
  {
    "slug": "bell",
    "name": "Bell",
    "short": "The hint sound, a soft temple bell that comes from the left edge of the table.",
    "aliases": [
      "Bell"
    ]
  },
  {
    "slug": "bells-test",
    "name": "Bells Test",
    "short": "A paper cancellation test where people circle small bells among other shapes. Its published Centre of Cancellation cut-off is shown in the therapist view as context only.",
    "aliases": [
      "Bells Test"
    ]
  },
  {
    "slug": "best-r",
    "name": "Best r",
    "short": "How orderly the search was, from 0 (scattered) to 1 (row by row): the stronger of the links between the order diyas were found and their position across or along the table.",
    "aliases": [
      "Best r",
      "best r",
      "Orderly"
    ]
  },
  {
    "slug": "cancellation-task",
    "name": "Cancellation task",
    "short": "A search task where you find and mark every target among distractors. Therapists use it to assess and train neglect; Purna's table is one.",
    "aliases": [
      "Cancellation task",
      "cancellation test",
      "cancellation tests",
      "cancellation sheets",
      "cancellation exercise",
      "cancellation"
    ]
  },
  {
    "slug": "centre-of-cancellation",
    "name": "Centre of Cancellation (CoC)",
    "short": "The average position of the targets found, from −1 (all on the left) to +1 (all on the right). Near 0 means both sides were searched evenly.",
    "aliases": [
      "Centre of Cancellation",
      "CoC"
    ]
  },
  {
    "slug": "chipped-diya",
    "name": "Chipped diya",
    "short": "A lamp with a piece missing on its left or right side. It shouldn't be lit; lighting one shows which side of objects is being missed.",
    "aliases": [
      "Chipped diya",
      "chipped diyas",
      "chipped diya",
      "chipped ones"
    ]
  },
  {
    "slug": "clad",
    "name": "CLAD",
    "short": "The AI agent that builds the Lens inside Lens Studio from Purna's design brief.",
    "aliases": [
      "CLAD"
    ]
  },
  {
    "slug": "crossings",
    "name": "Crossings",
    "short": "How many times the search path crossed itself. A tidy search crosses rarely.",
    "aliases": [
      "Crossings",
      "path crossings"
    ]
  },
  {
    "slug": "delete-everything",
    "name": "Delete everything",
    "short": "The button on the family dashboard that removes the person's name, sessions, links, notes and the next-session plan from Purna's servers.",
    "aliases": [
      "Delete everything"
    ]
  },
  {
    "slug": "diya",
    "name": "Diya",
    "short": "A small clay oil lamp, lit for festivals and prayer in South Asian homes. Lighting one is the action Purna's task is built around.",
    "aliases": [
      "Diya",
      "diyas",
      "diya"
    ]
  },
  {
    "slug": "doctor-link",
    "name": "Doctor link",
    "short": "A read-only link the family shares with the therapist. It works for 7 days, or until the family stops it.",
    "aliases": [
      "Doctor link",
      "doctor link",
      "read-only link"
    ]
  },
  {
    "slug": "diya-code",
    "name": "DIYA code",
    "short": "The short pairing code (like DIYA-7K3P) the glasses show the first time a session is sent, so the family can link the glasses to their dashboard.",
    "aliases": [
      "pairing code",
      "DIYA code"
    ]
  },
  {
    "slug": "egocentric-neglect",
    "name": "Egocentric neglect",
    "short": "Missing the left side of space relative to your own body: the left of the table, the room or the page.",
    "aliases": [
      "Egocentric neglect",
      "egocentric"
    ]
  },
  {
    "slug": "egocentric-asymmetry",
    "name": "Egocentric asymmetry",
    "short": "(right found − left found) ÷ (all found). Positive means a bias to the right.",
    "aliases": [
      "Egocentric asymmetry"
    ]
  },
  {
    "slug": "far-board",
    "name": "Far board",
    "short": "An optional second table, a virtual board 2 metres away, because neglect can differ near and far.",
    "aliases": [
      "Far board",
      "far board"
    ]
  },
  {
    "slug": "feel-neglect",
    "name": "Feel neglect",
    "short": "A switch on the browser table that fades the left of whatever you look at, roughly how neglect feels from the inside: nothing seems missing.",
    "aliases": [
      "Feel neglect"
    ]
  },
  {
    "slug": "head-turn",
    "name": "Head turn (head yaw)",
    "short": "How far the head turns left or right, in degrees. Purna measures the head, not the eyes.",
    "aliases": [
      "Head turn",
      "head yaw",
      "head turn",
      "yaw"
    ]
  },
  {
    "slug": "hemianopia",
    "name": "Hemianopia",
    "short": "Loss of half the field of vision. It can look like neglect on a search task, but it's a problem with seeing, not with attention. Purna can't tell the two apart.",
    "aliases": [
      "Hemianopia",
      "visual field loss",
      "hemianopia"
    ]
  },
  {
    "slug": "hint",
    "name": "Hint",
    "short": "The bell and the beam. Hint 1 (bell and pulse) comes after a few seconds with nothing found while diyas are still dark on the left; hint 2 (the sweep) comes if nothing changes. Hints point to the side, never at a diya.",
    "aliases": [
      "Hint",
      "hints"
    ]
  },
  {
    "slug": "leaf",
    "name": "LEAF",
    "short": "Lens Studio's automated test framework; Purna's Lens checks are written in it.",
    "aliases": [
      "LEAF"
    ]
  },
  {
    "slug": "left-spatial-neglect",
    "name": "Left spatial neglect",
    "short": "After a stroke on the right side of the brain, not noticing or responding to things on the left, even though the eyes work.",
    "aliases": [
      "Left spatial neglect",
      "spatial neglect",
      "left neglect",
      "neglect"
    ]
  },
  {
    "slug": "lens",
    "name": "Lens",
    "short": "An app for Snap's camera and glasses. Purna's Lens runs on Spectacles.",
    "aliases": [
      "Lens"
    ]
  },
  {
    "slug": "lens-studio",
    "name": "Lens Studio",
    "short": "Snap's tool for building Lenses.",
    "aliases": [
      "Lens Studio"
    ]
  },
  {
    "slug": "look-to-light",
    "name": "Look to light",
    "short": "An option for people who can't pinch: holding the head on a diya for 1.5 seconds lights it.",
    "aliases": [
      "Look to light"
    ]
  },
  {
    "slug": "next-session",
    "name": "Next session (therapist plan)",
    "short": "A level and hint delay the therapist chooses from the doctor link. The glasses suggest it on the setup panel once; the carer can still change it.",
    "aliases": [
      "Next session",
      "next session",
      "Set the next session"
    ]
  },
  {
    "slug": "occupational-therapy",
    "name": "Occupational therapy",
    "short": "The therapy that helps people do everyday activities again; it usually includes neglect training.",
    "aliases": [
      "Occupational therapy",
      "occupational therapist",
      "occupational therapy"
    ]
  },
  {
    "slug": "patient-bench",
    "name": "Patient bench",
    "short": "Purna's set of three scripted, simulated searchers (healthy, left neglect, object neglect) that play the real engine to check the measures. Not patients.",
    "aliases": [
      "Patient bench",
      "patient bench",
      "simulated players",
      "scripted searchers"
    ]
  },
  {
    "slug": "pinch",
    "name": "Pinch",
    "short": "Touching thumb and finger together to select something on Spectacles. A ray from a resting hand can pinch any diya, so no one has to reach across their body.",
    "aliases": [
      "Pinch",
      "pinch"
    ]
  },
  {
    "slug": "practice-not-treatment",
    "name": "Practice, not treatment",
    "short": "Purna is a way to practise a scanning task and see the results. It doesn't diagnose or treat, and it isn't a medical device.",
    "aliases": [
      "Practice, not treatment",
      "not a medical device"
    ]
  },
  {
    "slug": "replay",
    "name": "Replay",
    "short": "After the table, a glowing thread draws the search path in the order the diyas were found, and missed diyas pulse where they were.",
    "aliases": [
      "Replay",
      "replay"
    ]
  },
  {
    "slug": "revisit",
    "name": "Revisit",
    "short": "Pinching a diya that's already lit.",
    "aliases": [
      "Revisit",
      "revisits"
    ]
  },
  {
    "slug": "smooth-pursuit",
    "name": "Smooth pursuit",
    "short": "Following a moving object with the eyes. Purna's warm-up diyas only move left, because leftward pursuit can reduce neglect while rightward may worsen it.",
    "aliases": [
      "Smooth pursuit",
      "smooth pursuit"
    ]
  },
  {
    "slug": "spectacles",
    "name": "Spectacles",
    "short": "Snap's see-through augmented-reality glasses.",
    "aliases": [
      "Spectacles",
      "Snap Spectacles",
      "SPECS"
    ]
  },
  {
    "slug": "time-by-third",
    "name": "Time by third",
    "short": "The average seconds it took to find a diya in the left, centre and right thirds of the table.",
    "aliases": [
      "Time by third",
      "time per third"
    ]
  },
  {
    "slug": "trend-band",
    "name": "Trend band",
    "short": "The shaded band on the progress chart: the person's usual change from one session to the next. A change inside it may be chance.",
    "aliases": [
      "Trend band",
      "shaded band",
      "day-to-day band"
    ]
  },
  {
    "slug": "wcag",
    "name": "WCAG",
    "short": "The Web Content Accessibility Guidelines, the international standard for accessible websites. Purna's site is checked against WCAG 2.1 level AA.",
    "aliases": [
      "WCAG",
      "WCAG 2.1"
    ]
  }
];

export const termBySlug = (slug: string) => GLOSSARY.find((t) => t.slug === slug);
