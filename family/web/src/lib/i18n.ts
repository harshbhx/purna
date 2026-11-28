// English and Hindi for the family's own screens (dashboard, its dialogs, a session, join and sign-in messages).
// The therapist view stays in English. Sentences built from numbers have their own functions, so Hindi word
// order is right rather than translated word by word.
import { createContext, useContext } from "react";
import type { SessionJson } from "./types";

export type Lang = "en" | "hi";
const KEY = "purna.lang";

export function getLang(): Lang {
  try { return localStorage.getItem(KEY) === "hi" ? "hi" : "en"; } catch { return "en"; }
}
export function saveLang(l: Lang): void {
  try { localStorage.setItem(KEY, l); } catch { /* private mode: the choice lasts this visit */ }
  if (typeof document !== "undefined") document.documentElement.lang = l === "hi" ? "hi" : "en";
}

export const LangContext = createContext<Lang>("en");
export const useLang = () => useContext(LangContext);
export const locale = (l: Lang) => (l === "hi" ? "hi-IN" : undefined);

const EN = {
  example: "Example",
  pairGlasses: "Pair glasses",
  signOut: "Sign out here",
  switchTo: "हिन्दी",
  switchToLabel: "Show this page in Hindi",
  practiceOf: (name: string) => `${name}’s practice`,
  shareDoctor: "Share with doctor",
  inviteFamily: "Invite family",
  demoAlert: "This is an example with simulated data. Pair with a code from the glasses to see a real practice.",
  noPractice: "No practice yet. Start one on the glasses, then pinch Send to family.",
  since: (weekday: string) => `No practice since ${weekday}. A few minutes today helps.`,
  latest: "Latest session",
  earlier: "Earlier sessions",
  noneYet: "Sessions show up here after the first practice.",
  overTime: "Over time",
  overTimeHelp: "Share of diyas found on each side. The solid line is the left side.",
  chartLater: "The chart appears after the first session.",
  band: (name: string) => `Shaded: ${name}’s usual change from one session to the next. A change inside it may be chance.`,
  notesTitle: "Notes from the therapist",
  notesEmpty: "When the therapist writes a note on the doctor link, it shows here.",
  manage: "Manage",
  importLogger: "Import from Logger",
  deleteAll: "Delete everything",
  openSession: "Open session from",
  wholeTable: "Whole table",
  hints: (n: number) => (n === 1 ? "1 hint" : `${n} hints`),
  left: "Left",
  right: "Right",
  replay: "Replay",
  replayLegend: "Numbers: order found. Dashed: missed.",
  notDiagnosis: "Practice result, not a diagnosis. Share it with your therapist.",
  detailsTherapist: "Details for the therapist",
  shareTitle: "Share with doctor",
  shareHelp: "Makes a read-only link to every session. It stops working after 7 days, or when you stop it here.",
  makeLink: "Make a 7-day link",
  shareOnce: "Send this to the therapist. You’ll only see it once, so copy it now.",
  copyLink: "Copy link",
  copyInvite: "Copy invite link",
  copied: "Copied ✓",
  copyThis: "Copy this:",
  activeLinks: "Active links",
  noLinks: "None yet.",
  madeUntil: (made: string, until: string) => `Made ${made}, works until ${until}`,
  stopSharing: "Stop sharing",
  stopped: "Stopped. That link no longer works.",
  inviteTitle: "Invite family",
  inviteHelp: "Send this link to a brother, sister or carer. Anyone with it can see this practice, so share it only with family.",
  importTitle: "Import from Logger",
  importHelp: "If the glasses couldn’t send, copy the line that starts with PURNA_SESSION from the Lens Studio Logger and paste it here.",
  sessionLine: "Session line",
  importBtn: "Import",
  imported: "Imported ✓",
  alreadyHere: "Already here. Nothing changed.",
  notASession: "That doesn't look like a Purna session. Copy the whole line that starts with PURNA_SESSION.",
  deleteTitle: "Delete everything?",
  deleteHelp: "Removes every session, note, doctor link and the paired glasses. This can’t be undone.",
  typeToConfirm: (name: string) => `Type “${name}” to confirm`,
  cancel: "Cancel",
  signedOut: "Signed out on this device. Use your invite link to come back.",
  deleted: "Everything is deleted. To start again, send a session from the glasses for a new code.",
  keyGone: "This family link isn't valid any more. Ask your family for a new invite link, or pair again with a code from the glasses.",
  measures: { sides: "Left vs right", chipped: "Chipped diyas", order: "Search order", head: "Head turn" },
  replayAria: (lit: number, mL: number, mR: number, cL: number, cR: number) => `Table seen from above. ${lit} diyas lit, numbered in the order found. Missed: ${mL} on the left, ${mR} on the right. Chipped diyas lit by mistake: ${cL} with the gap on the left, ${cR} with the gap on the right.`,
  replayLeft: "← Left",
  replayRight: "Right →",
  replaySeat: "they sit here",
};

type Dict = typeof EN;

const HI: Dict = {
  example: "उदाहरण",
  pairGlasses: "चश्मा जोड़ें",
  signOut: "साइन आउट",
  switchTo: "English",
  switchToLabel: "Show this page in English",
  practiceOf: (name) => `${name} का अभ्यास`,
  shareDoctor: "डॉक्टर के साथ साझा करें",
  inviteFamily: "परिवार को जोड़ें",
  demoAlert: "यह नकली (सिम्युलेटेड) डेटा वाला एक उदाहरण है। असली अभ्यास देखने के लिए चश्मे पर दिखा कोड डालें।",
  noPractice: "अभी कोई अभ्यास नहीं हुआ। चश्मे पर एक सत्र शुरू करें, फिर \"Send to family\" पर पिंच करें।",
  since: (weekday) => `${weekday} से कोई अभ्यास नहीं हुआ। आज के कुछ मिनट मदद करेंगे।`,
  latest: "सबसे नया सत्र",
  earlier: "पिछले सत्र",
  noneYet: "पहले अभ्यास के बाद सत्र यहाँ दिखेंगे।",
  overTime: "समय के साथ",
  overTimeHelp: "हर तरफ़ मिले दीयों का हिस्सा। ठोस रेखा बाईं ओर की है।",
  chartLater: "पहले सत्र के बाद चार्ट दिखेगा।",
  band: (name) => `छायांकित पट्टी: एक सत्र से अगले सत्र तक ${name} का सामान्य बदलाव। इसके भीतर का बदलाव संयोग हो सकता है।`,
  notesTitle: "थेरेपिस्ट के नोट",
  notesEmpty: "जब थेरेपिस्ट डॉक्टर लिंक पर नोट लिखेंगे, वह यहाँ दिखेगा।",
  manage: "प्रबंधन",
  importLogger: "Logger से जोड़ें",
  deleteAll: "सब कुछ मिटाएँ",
  openSession: "यह सत्र खोलें:",
  wholeTable: "पूरी मेज़",
  hints: (n) => `${n} संकेत`,
  left: "बायाँ",
  right: "दायाँ",
  replay: "फिर से चलाएँ",
  replayLegend: "अंक: मिलने का क्रम। धारीदार घेरा: छूटा हुआ।",
  notDiagnosis: "यह अभ्यास का परिणाम है, निदान नहीं। इसे अपने थेरेपिस्ट को दिखाएँ।",
  detailsTherapist: "थेरेपिस्ट के लिए विवरण",
  shareTitle: "डॉक्टर के साथ साझा करें",
  shareHelp: "हर सत्र का एक केवल-देखने वाला लिंक बनाता है। यह 7 दिन बाद, या यहाँ रोकने पर, काम करना बंद कर देता है।",
  makeLink: "7 दिन का लिंक बनाएँ",
  shareOnce: "यह लिंक थेरेपिस्ट को भेजें। यह सिर्फ़ एक बार दिखेगा, इसलिए अभी कॉपी कर लें।",
  copyLink: "लिंक कॉपी करें",
  copyInvite: "आमंत्रण लिंक कॉपी करें",
  copied: "कॉपी हो गया ✓",
  copyThis: "इसे कॉपी करें:",
  activeLinks: "चालू लिंक",
  noLinks: "अभी कोई नहीं।",
  madeUntil: (made, until) => `${made} को बना, ${until} तक चलेगा`,
  stopSharing: "साझा करना बंद करें",
  stopped: "बंद कर दिया। वह लिंक अब काम नहीं करेगा।",
  inviteTitle: "परिवार को जोड़ें",
  inviteHelp: "यह लिंक भाई, बहन या देखभाल करने वाले को भेजें। जिसके पास यह लिंक है वह यह अभ्यास देख सकता है, इसलिए इसे सिर्फ़ परिवार के साथ साझा करें।",
  importTitle: "Logger से जोड़ें",
  importHelp: "अगर चश्मा सत्र नहीं भेज पाया, तो Lens Studio Logger में PURNA_SESSION से शुरू होने वाली पंक्ति कॉपी करके यहाँ चिपकाएँ।",
  sessionLine: "सत्र की पंक्ति",
  importBtn: "जोड़ें",
  imported: "जुड़ गया ✓",
  alreadyHere: "यह पहले से यहाँ है। कुछ नहीं बदला।",
  notASession: "यह Purna सत्र नहीं लगता। PURNA_SESSION से शुरू होने वाली पूरी पंक्ति कॉपी करें।",
  deleteTitle: "सब कुछ मिटाएँ?",
  deleteHelp: "हर सत्र, नोट, डॉक्टर लिंक और जुड़ा हुआ चश्मा हट जाएगा। इसे वापस नहीं लाया जा सकता।",
  typeToConfirm: (name) => `पुष्टि के लिए “${name}” लिखें`,
  cancel: "रद्द करें",
  signedOut: "इस डिवाइस से साइन आउट हो गए। वापस आने के लिए अपना आमंत्रण लिंक खोलें।",
  deleted: "सब कुछ मिट गया। फिर से शुरू करने के लिए चश्मे से एक सत्र भेजें, नया कोड मिलेगा।",
  keyGone: "यह पारिवारिक लिंक अब मान्य नहीं है। परिवार से नया आमंत्रण लिंक माँगें, या चश्मे के कोड से फिर से जोड़ें।",
  replayAria: (lit: number, mL: number, mR: number, cL: number, cR: number) => `ऊपर से दिखती मेज़। ${lit} दीये जले, मिलने के क्रम में अंकित। छूटे: बाईं ओर ${mL}, दाईं ओर ${mR}। ग़लती से जले टूटे दीये: बाईं दरार वाले ${cL}, दाईं दरार वाले ${cR}।`,
  replayLeft: "← बायाँ",
  replayRight: "दायाँ →",
  replaySeat: "आप यहाँ बैठते हैं",
  measures: { sides: "बायाँ बनाम दायाँ", chipped: "टूटे दीये", order: "खोजने का क्रम", head: "सिर का घुमाव" },
};

export const STRINGS: Record<Lang, Dict> = { en: EN, hi: HI };
export const useT = () => STRINGS[useLang()];

export interface SummaryNumbers { summary: string; leftHits: number; leftTotal: number; rightHits: number; rightTotal: number; hints: number; maxLeftDeg: number }

/** The one-line summary. English is Core's sentence (Report.summarySentence); Hindi is built from the same numbers. */
export function summaryOf(c: SummaryNumbers, l: Lang): string {
  if (l === "en") return c.summary;
  const hints = c.hints === 0 ? "कोई संकेत नहीं।" : `${c.hints} संकेत।`;
  return `बाईं ओर ${c.leftTotal} में से ${c.leftHits} और दाईं ओर ${c.rightTotal} में से ${c.rightHits} मिले। ${hints} बाईं ओर ${Math.round(c.maxLeftDeg)}° तक मुड़े।`;
}

export const numbersOf = (s: SessionJson): SummaryNumbers => ({
  summary: s.summary, leftHits: s.near.leftHits, leftTotal: s.near.leftTotal, rightHits: s.near.rightHits, rightTotal: s.near.rightTotal,
  hints: s.cues.hint1 + s.cues.hint2, maxLeftDeg: s.head.maxLeftDeg,
});

const PRESET_HI: Record<string, string> = { easy: "आसान", standard: "सामान्य", hard: "कठिन" };
export const presetName = (p: string, l: Lang) => (l === "hi" ? PRESET_HI[p] ?? p : p.charAt(0).toUpperCase() + p.slice(1));

/** The four plain-language measures in the session dialog. */
export function measuresIn(s: SessionJson, l: Lang): { label: string; value: string }[] {
  const n = s.near;
  const m = STRINGS[l].measures;
  if (l === "en") return [];
  const chips = n.fpChipLeft + n.fpChipRight;
  return [
    { label: m.sides, value: `बायाँ ${n.leftHits}/${n.leftTotal}, दायाँ ${n.rightHits}/${n.rightTotal}` },
    { label: m.chipped, value: chips === 0 ? "कोई ग़लती से नहीं जला" : `ग़लती से जले: बाईं दरार ${n.fpChipLeft}, दाईं दरार ${n.fpChipRight}` },
    { label: m.order, value: n.bestR === null ? "–" : `क्रम ${n.bestR.toFixed(2)}, ${n.crossings} बार रास्ता कटा, ${n.revisits} बार दोबारा` },
    { label: m.head, value: `बाईं ओर ${Math.round(s.head.maxLeftDeg)}° तक` },
  ];
}
