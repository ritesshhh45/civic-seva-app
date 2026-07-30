import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { configQuery } from "@/lib/queries";
import { pick, useLang } from "@/lib/i18n";
import { getDeviceId, getProfile, saveProfile } from "@/lib/device";
import { registerCitizen } from "@/lib/citizen";
import { requestNotificationPermission } from "@/lib/push";
import { LangToggle } from "@/components/LangToggle";
import { AppImage } from "@/components/AppImage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sanjay Chaudhary — Ward Seva App" },
      {
        name: "description",
        content:
          "Report water, road, drainage, electricity and streetlight problems in your ward directly to Sanjay Chaudhary on WhatsApp.",
      },
      { property: "og:title", content: "Sanjay Chaudhary — Ward Seva App" },
      {
        property: "og:description",
        content: "Report water, road, drainage, electricity and streetlight problems in your ward directly to Sanjay Chaudhary on WhatsApp.",
      },
    ],
  }),
  component: Entry,
});

function Entry() {
  const navigate = useNavigate();
  const { lang, t } = useLang();
  const { data: config } = useQuery(configQuery);
  const [showSplash, setShowSplash] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    void requestNotificationPermission();
    const hasProfile = !!getProfile();
    const timer = setTimeout(() => {
      if (hasProfile) navigate({ to: "/home" });
      else {
        setShowSplash(false);
        setNeedsLogin(true);
      }
    }, 3400);
    return () => clearTimeout(timer);
  }, [navigate]);

  if (showSplash || !needsLogin) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[oklch(0.18_0.02_60)]">
        {/* Full-bleed portrait, cropped to fill any phone screen */}
        <AppImage
          src={config?.splash_photo_url || config?.photo_url}
          alt={config ? pick(lang, config.rep_name_mr, config.rep_name_en) : ""}
          position="top"
          fallback="none"
          className="absolute inset-0 h-full w-full"
        />

        {/* Readability gradient only at the top and bottom text areas */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[oklch(0.2_0.03_60_/_0.8)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[oklch(0.18_0.03_60_/_0.94)] via-[oklch(0.2_0.03_60_/_0.6)] to-transparent" />

        <div className="tricolor-bar absolute inset-x-0 top-0 h-1.5" />

        <div className="absolute inset-x-0 top-0 flex justify-center pt-8">
          {config?.party_logo_url ? (
            <AppImage
              src={config.party_logo_url}
              alt={pick(lang, config.party_name_mr, config.party_name_en)}
              fallback="none"
              className="h-16 w-16 rounded-full bg-card/90 p-1 shadow-soft ring-2 ring-primary/30"
            />
          ) : null}
        </div>

        <div className="animate-rise absolute inset-x-0 bottom-0 px-6 pb-12 text-center">
          <span className="inline-block rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-soft">
            {config ? pick(lang, config.ward_mr, config.ward_en) : ""}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight text-white drop-shadow-lg">
            {config ? pick(lang, config.rep_name_mr, config.rep_name_en) : ""}
          </h1>
          <p className="mt-2 text-sm font-semibold text-white/85">
            {config ? pick(lang, config.slogan_mr, config.slogan_en) : ""}
          </p>
        </div>

        <div className="tricolor-bar absolute inset-x-0 bottom-0 h-2" />
      </div>
    );
  }



  return <LoginScreen />;
}

function LoginScreen() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError(t("nameErr"));
    if (!/^\d{10}$/.test(mobile.trim())) return setError(t("mobileErr"));
    setError(null);
    setBusy(true);
    try {
      await registerCitizen({ deviceId: getDeviceId(), name: name.trim(), mobile: mobile.trim() });
      saveProfile({ name: name.trim(), mobile: mobile.trim() });
      navigate({ to: "/home" });
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="tricolor-bar h-1.5 w-full" />
      <div className="mx-auto flex max-w-md justify-end px-4 pt-3">
        <LangToggle />
      </div>
      <form onSubmit={submit} className="mx-auto max-w-md px-5 pt-6">
        <h1 className="text-2xl font-extrabold">{t("loginTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("loginSub")}</p>

        <div className="card-soft mt-6 space-y-4 p-5">
          <label className="block">
            <span className="text-sm font-semibold">{t("name")}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:border-primary"
              autoComplete="name"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">{t("mobile")}</span>
            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              inputMode="numeric"
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-base tracking-wide outline-none focus:border-primary"
              autoComplete="tel"
            />
          </label>
          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-primary py-3.5 text-base font-bold text-primary-foreground shadow-soft disabled:opacity-60"
          >
            {t("submit")}
          </button>
        </div>
      </form>
    </div>
  );
}
