import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { configQuery } from "@/lib/queries";
import { pick, useLang } from "@/lib/i18n";
import { getDeviceId, getProfile, saveProfile } from "@/lib/device";
import { registerCitizen } from "@/lib/citizen";
import { playWelcomeAudioOnce, preloadWelcomeAudio } from "@/lib/welcomeAudio";
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
        content:
          "Report water, road, drainage, electricity and streetlight problems in your ward directly to Sanjay Chaudhary on WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preload", as: "image", href: "/photos/portrait-splash.jpg" },
      { rel: "preload", as: "image", href: "/photos/portrait-header.jpg" },
    ],
  }),
  component: Entry,
});

function Entry() {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const { data: config } = useQuery(configQuery);

  // Welcome audio is optional: preloaded, played once, never blocking.
  useEffect(() => {
    const audio = preloadWelcomeAudio(config?.welcome_audio_url);
    if (!audio) return;
    const timer = setTimeout(() => playWelcomeAudioOnce(audio), 300);
    return () => {
      clearTimeout(timer);
      try {
        audio.pause();
      } catch {
        /* ignore */
      }
    };
  }, [config?.welcome_audio_url]);

  useEffect(() => {
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
            src="/branding/bjp-lotus.png"
            alt="Bharatiya Janata Party lotus"
            priority
            className="h-12 w-12 rounded-full bg-transparent"
          />
        </div>
      </div>

      {/* portrait */}
      <div className="relative z-10 mt-10 flex flex-1 flex-col items-center px-8">
        <div className="animate-portrait gold-rim h-56 w-56 overflow-hidden rounded-full">
          <AppImage
            src={config?.splash_photo_url || config?.photo_url || "/photos/portrait-splash.jpg"}
            alt={name}
            position="top"
            priority
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
      <div
        className="fade-up relative z-10 w-full max-w-xs px-8 pb-10 text-center"
        style={{ animationDelay: "640ms" }}
      >
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
  const { t, lang } = useLang();
  const { data: config } = useQuery(configQuery);

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
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="tricolor-bar h-1.5 w-full" />

      {/* premium saffron welcome header */}
      <header className="relative overflow-hidden">
        <div className="saffron-gradient absolute inset-0" aria-hidden />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-10 h-48 w-48 rounded-full bg-[oklch(0.85_0.15_140)]/25 blur-3xl"
        />

        <div className="relative mx-auto max-w-md px-5 pb-16 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white/90 shadow-soft ring-1 ring-white/70">
              <AppImage
                src="/branding/bjp-lotus.png"
                alt="Bharatiya Janata Party lotus"
                priority
                className="h-8 w-8 rounded-full bg-transparent"
              />
            </div>
            <LangToggle />
          </div>

          <div className="mt-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-white/90 p-1.5 shadow-[0_18px_40px_-18px_rgba(120,60,0,0.65)]">
              <AppImage
                src={config?.header_photo_url || config?.photo_url || "/photos/portrait-header.jpg"}
                alt={config ? pick(lang, config.rep_name_mr, config.rep_name_en) : ""}
                position="top"
                priority
                className="h-28 w-28 rounded-full"
              />
            </div>
            <p className="mt-4 text-xl font-extrabold text-white drop-shadow-sm">
              आपले हार्दिक स्वागत आहे
            </p>
            <p className="mt-1 text-sm font-semibold text-white/90">
              {config ? pick(lang, config.rep_name_mr, config.rep_name_en) : ""} •{" "}
              {config ? pick(lang, config.ward_mr, config.ward_en) : ""}
            </p>
          </div>
        </div>

        {/* abstract tricolour wave */}
        <svg
          viewBox="0 0 400 60"
          preserveAspectRatio="none"
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-14 w-full"
        >
          <path d="M0 34 Q100 6 200 30 T400 22 V60 H0Z" fill="oklch(0.75 0.16 140 / 0.35)" />
          <path d="M0 42 Q110 16 210 38 T400 32 V60 H0Z" fill="oklch(0.98 0.02 90 / 0.6)" />
          <path d="M0 50 Q120 28 220 46 T400 42 V60 H0Z" fill="var(--background)" />
        </svg>
      </header>

      <form onSubmit={submit} className="mx-auto -mt-4 max-w-md px-5">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2">
            <span className="h-5 w-1.5 rounded-full bg-primary" />
            <h1 className="text-xl font-extrabold">{t("loginTitle")}</h1>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">{t("loginSub")}</p>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold">{t("name")}</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-input bg-card px-4 py-3.5 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                autoComplete="name"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold">{t("mobile")}</span>
              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                inputMode="numeric"
                className="mt-1.5 w-full rounded-2xl border border-input bg-card px-4 py-3.5 text-base tracking-wide outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                autoComplete="tel"
              />
            </label>
            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
            <button
              type="submit"
              disabled={busy}
              className="press w-full rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-soft disabled:opacity-60"
            >
              {t("submit")}
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="h-px w-8 bg-border" />
          जनसेवा • विकास • विश्वास
          <span className="h-px w-8 bg-border" />
        </div>
        <p className="mt-3 text-center text-[0.7rem] text-muted-foreground">
          Developed by <span className="font-semibold text-foreground">Ritesh Pawar</span>
        </p>
      </form>
    </div>
  );
}
