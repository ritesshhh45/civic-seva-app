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

const SITE = "https://civic-seva-app.vercel.app";

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
      { property: "og:image", content: `${SITE}/photos/portrait-header.jpg` },
      { name: "twitter:image", content: `${SITE}/photos/portrait-header.jpg` },
    ],
    links: [
      { rel: "preload", as: "image", href: "/photos/portrait-splash.jpg", fetchpriority: "high" },
      { rel: "preload", as: "image", href: "/photos/portrait-header.jpg" },
    ],
  }),
  component: Entry,
});


function Entry() {
  const navigate = useNavigate();
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
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  if (showSplash || !needsLogin) return <SplashScreen />;

  return <LoginScreen />;
}

/** Slow-floating golden motes, seeded so every run looks the same. */
const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 37) % 96,
  size: 3 + ((i * 5) % 5),
  delay: (i * 0.83) % 11,
  duration: 9 + ((i * 3) % 7),
}));

function SplashScreen() {
  const { lang } = useLang();
  const { data: config } = useQuery(configQuery);

  const name = config ? pick(lang, config.rep_name_mr, config.rep_name_en) : "Sanjay Chaudhary";
  const ward = config ? pick(lang, config.ward_mr, config.ward_en) : "Ward No. 10";

  return (
    <div className="sunrise-bg relative flex min-h-screen flex-col items-center overflow-hidden">
      {/* soft moving sun light */}
      <div className="sun-glow pointer-events-none absolute -bottom-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full" />

      {/* skyline silhouette */}
      <svg
        viewBox="0 0 400 120"
        preserveAspectRatio="none"
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full opacity-25"
      >
        <path
          fill="oklch(0.62 0.14 55)"
          d="M0 120V78h18V58h14v20h16V44h10v34h20V62h18v16h12V34h12v44h18V56h16v22h14V46h12v32h22V66h16v12h14V40h12v38h18V60h16v18h14V50h12v28h22V70h16v8h12V120z"
        />
      </svg>

      {PARTICLES.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className="gold-particle pointer-events-none absolute bottom-24"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      {/* top app logo */}
      <div className="fade-up relative z-10 pt-10">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white/85 shadow-[0_10px_30px_-14px_rgba(120,70,10,0.6)] ring-1 ring-white/70 backdrop-blur-md">
          <AppImage
            src={config?.app_icon_url || config?.party_logo_url}
            alt=""
            fallback="none"
            className="h-12 w-12 rounded-full bg-transparent"
          />
        </div>
      </div>

      {/* portrait */}
      <div className="relative z-10 mt-10 flex flex-1 flex-col items-center px-8">
        <div className="animate-portrait gold-rim h-56 w-56 overflow-hidden rounded-full">
          <AppImage
            src={config?.splash_photo_url || config?.photo_url}
            alt={name}
            position="top"
            className="h-full w-full bg-white/40"
          />
        </div>

        <h1
          className="fade-up mt-8 text-center text-[2rem] font-extrabold leading-tight tracking-tight text-[oklch(0.32_0.07_50)]"
          style={{ animationDelay: "220ms" }}
        >
          {name}
        </h1>
        <p
          className="fade-up mt-2 text-center text-[0.8rem] font-semibold uppercase tracking-[0.22em] text-[oklch(0.5_0.12_50)]"
          style={{ animationDelay: "340ms" }}
        >
          Corporator • {ward}
        </p>
        <p
          className="fade-up mt-5 text-center text-base font-bold tracking-wide text-[oklch(0.38_0.09_48)]"
          style={{ animationDelay: "460ms" }}
        >
          जनसेवा • विकास • विश्वास
        </p>
        <p
          className="fade-up mt-1.5 text-center text-sm text-[oklch(0.48_0.05_55)]"
          style={{ animationDelay: "560ms" }}
        >
          आपल्या सेवेत सदैव तत्पर
        </p>
      </div>

      {/* loading */}
      <div className="fade-up relative z-10 w-full max-w-xs px-8 pb-10 text-center" style={{ animationDelay: "640ms" }}>
        <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-white/60">
          <div className="tri-sweep tricolor-bar absolute inset-y-0 left-0 w-1/2 rounded-full" />
        </div>
        <p className="mt-4 text-xs font-semibold tracking-wide text-[oklch(0.5_0.06_55)]">
          Preparing Citizen Services…
        </p>
        <p className="mt-6 text-[0.65rem] uppercase tracking-[0.18em] text-[oklch(0.6_0.04_60)]">
          Powered by {ward} Digital Services
        </p>
      </div>
    </div>
  );
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
