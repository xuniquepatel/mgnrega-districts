export type Lang = "en" | "hi" | "gu";

export const STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    appTitle: "MGNREGA District Dashboard",
    pickDistrict: "Select District",
    useMyLocation: "Use my location",
    online: "Online",
    offline: "Offline (showing cached data)",
    lastUpdated: "Last updated",
    householdsWorked: "Households worked",
    persondays: "Total person-days",
    avgDays: "Avg days per household",
    womenShare: "Women person-days %",
    jobcards: "Jobcards issued",
    workers: "Total workers",
    compareVsState: "Compared to state avg",
    speakToggle: "Audio",
  },
  hi: {
    appTitle: "मनरेगा जिला डैशबोर्ड",
    pickDistrict: "जिला चुनें",
    useMyLocation: "मेरी लोकेशन",
    online: "ऑनलाइन",
    offline: "ऑफलाइन (कैश किया हुआ डेटा)",
    lastUpdated: "आख़िरी अपडेट",
    householdsWorked: "काम करने वाले परिवार",
    persondays: "कुल मानव-दिवस",
    avgDays: "औसत दिन/परिवार",
    womenShare: "महिला मानव-दिवस %",
    jobcards: "जारी जॉबकार्ड",
    workers: "कुल श्रमिक",
    compareVsState: "राज्य औसत से तुलना",
    speakToggle: "ऑडियो",
  },
  gu: {
    appTitle: "મહા. રોજગાર યોજના જિલ્લા ડેશબોર્ડ",
    pickDistrict: "જિલ્લો પસંદ કરો",
    useMyLocation: "મારું સ્થાન",
    online: "ઓનલાઇન",
    offline: "ઑફલાઇન (કૅશ ડેટા)",
    lastUpdated: "છેલ્લું અપડેટ",
    householdsWorked: "કામ કરેલ કુટુંબો",
    persondays: "કુલ પર્સન-ડેઝ",
    avgDays: "સરેરાશ દિવસ/કુટુંબ",
    womenShare: "મહિલા પર્સન-ડેઝ %",
    jobcards: "જારી થયેલા જૉબકાર્ડ",
    workers: "કુલ શ્રમિક",
    compareVsState: "રાજ્ય સરેરાશની સામે",
    speakToggle: "ઑડિયો",
  },
};

export function shortNum(n?: number | null, lang: Lang = "en"): string {
  if (n == null) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e7) return `${(n / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `${(n / 1e5).toFixed(2)} L`;
  return new Intl.NumberFormat(lang).format(n);
}

export function t(lang: Lang, key: string): string {
  return STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key;
}

export function speak(text: string, lang: Lang) {
  if (!("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang === "hi" ? "hi-IN" : lang === "gu" ? "gu-IN" : "en-IN";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}
