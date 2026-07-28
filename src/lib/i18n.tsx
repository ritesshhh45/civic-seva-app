import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "mr" | "en";

const dict = {
  mr: {
    call: "फोन करा",
    whatsapp: "व्हॉट्सअ‍ॅप",
    home: "मुख्यपृष्ठ",
    complaints: "तक्रारी",
    updates: "सूचना",
    profile: "प्रोफाइल",
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
  },
  en: {
    call: "Call",
    whatsapp: "WhatsApp",
    home: "Home",
    complaints: "Complaints",
    updates: "Updates",
    profile: "Profile",
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
