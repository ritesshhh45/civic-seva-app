import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "mr" | "en";

const dict = {
  mr: {
    call: "फोन करा",
    whatsapp: "व्हॉट्सअ‍ॅप",
    office: "कार्यालय",
    home: "मुख्यपृष्ठ",
    complaints: "तक्रारी",
    updates: "अपडेट्स",
    profile: "प्रोफाइल",
    services: "सेवा",
    schemes: "योजना",
    pickCategory: "तक्रारीचा प्रकार निवडा",
    loginTitle: "आपली माहिती द्या",
    loginSub: "फक्त एकदाच — नाव आणि मोबाइल क्रमांक",
    name: "पूर्ण नाव",
    mobile: "मोबाइल क्रमांक",
    submit: "पुढे जा",
    nameErr: "कृपया नाव लिहा",
    mobileErr: "१० अंकी मोबाइल क्रमांक टाका",
    noComplaints: "अद्याप कोणतीही तक्रार नोंदवलेली नाही",
    noUpdates: "अद्याप कोणतीही सूचना नाही",
    myComplaints: "माझ्या तक्रारी",
    gallery: "छायाचित्रे",
    logout: "बाहेर पडा",
    admin: "प्रशासन",
    savedInfo: "तुमची माहिती",
    opening: "व्हॉट्सअ‍ॅप उघडत आहे...",
    greeting: "नमस्कार",
    todayUpdates: "आजचे अपडेट्स",
    viewAll: "सर्व पहा",
    devWorks: "विकासकामे",
    complaintTitle: "तक्रार नोंदवा",
    complaintSub: "फक्त एका क्लिकमध्ये WhatsApp वर संदेश पाठवा.",
    chooseIssue: "समस्या निवडा",
    important: "महत्त्वाचे",
    applyNow: "अर्ज करा",
    eligibility: "पात्रता",
    documents: "आवश्यक कागदपत्रे",
    benefits: "लाभ",
    lastDate: "शेवटची तारीख",
    website: "अधिकृत संकेतस्थळ",
    newTag: "नवीन",
    featured: "प्रमुख",
    all: "सर्व",
    photos: "फोटो",
    videos: "व्हिडिओ",
    noSchemes: "अद्याप योजना जोडलेली नाही",
    servicesSub: "सेवा निवडा — थेट व्हॉट्सअ‍ॅपवर संदेश जाईल",
    schemesSub: "शासकीय योजनांची माहिती व अर्ज",
  },
  en: {
    call: "Call",
    whatsapp: "WhatsApp",
    office: "Office",
    home: "Home",
    complaints: "Complaints",
    updates: "Updates",
    profile: "Profile",
    services: "Services",
    schemes: "Schemes",
    pickCategory: "Choose a complaint type",
    loginTitle: "Tell us about you",
    loginSub: "Just once — your name and mobile number",
    name: "Full name",
    mobile: "Mobile number",
    submit: "Continue",
    nameErr: "Please enter your name",
    mobileErr: "Enter a 10-digit mobile number",
    noComplaints: "No complaints raised yet",
    noUpdates: "No updates yet",
    myComplaints: "My complaints",
    gallery: "Gallery",
    logout: "Log out",
    admin: "Admin",
    savedInfo: "Your details",
    opening: "Opening WhatsApp...",
    greeting: "Namaskar",
    todayUpdates: "Today's updates",
    viewAll: "View all",
    devWorks: "Development works",
    complaintTitle: "Register a complaint",
    complaintSub: "Send your message on WhatsApp in a single tap.",
    chooseIssue: "Choose an issue",
    important: "Important",
    applyNow: "Apply now",
    eligibility: "Eligibility",
    documents: "Required documents",
    benefits: "Benefits",
    lastDate: "Last date",
    website: "Official website",
    newTag: "New",
    featured: "Featured",
    all: "All",
    photos: "Photos",
    videos: "Videos",
    noSchemes: "No schemes added yet",
    servicesSub: "Pick a service — your message opens straight in WhatsApp",
    schemesSub: "Government scheme details and applications",
  },
} as const;

type Key = keyof typeof dict.mr;

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string }>({
  lang: "mr",
  setLang: () => {},
  t: (k) => dict.mr[k],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("mr");

  useEffect(() => {
    const saved = localStorage.getItem("app_lang");
    if (saved === "en" || saved === "mr") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("app_lang", l);
  };

  return (
    <LangCtx.Provider value={{ lang, setLang, t: (k) => dict[lang][k] }}>
      {children}
    </LangCtx.Provider>
  );
}

export const useLang = () => useContext(LangCtx);

/** Pick the Marathi or English variant of an admin-entered field. */
export function pick(lang: Lang, mr?: string | null, en?: string | null) {
  if (lang === "en") return (en && en.trim()) || mr || "";
  return (mr && mr.trim()) || en || "";
}
