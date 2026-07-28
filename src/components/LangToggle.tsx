import { useLang } from "@/lib/i18n";

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === "mr" ? "en" : "mr")}
      className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary"
      aria-label="Change language"
    >
      {lang === "mr" ? "EN" : "मराठी"}
    </button>
  );
}
