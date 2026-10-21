import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, ChevronLeft } from "lucide-react";
import { getProfile, type Profile } from "@/lib/device";
import { configQuery, updatesQuery } from "@/lib/queries";
import { BottomNav } from "./BottomNav";
import { AppImage } from "./AppImage";
import { LangToggle } from "./LangToggle";
import { pick, useLang } from "@/lib/i18n";

type Props = {
  children: (profile: Profile) => ReactNode;
  /** Screen title shown in a compact page header instead of the greeting header. */
  title?: string;
  subtitle?: string;
  back?: boolean;
};

export function AppLayout({ children, title, subtitle, back }: Props) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  const { lang, t } = useLang();
  const { data: config } = useQuery(configQuery);
  const { data: updates } = useQuery(updatesQuery);

  useEffect(() => {
    const p = getProfile();
    if (!p) {
      navigate({ to: "/" });
      return;
    }
    setProfile(p);
    setReady(true);
  }, [navigate]);

  if (!ready || !profile) {
    return <div className="min-h-screen cream-gradient" />;
  }

  const unread = (updates ?? []).length;

  return (
    <div className="min-h-screen cream-gradient pb-28">
      <div className="tricolor-bar h-1.5 w-full" />

      <header className="mx-auto max-w-md px-5 pt-4">
        <div className="flex items-center gap-3">
          {back ? (
            <button
              onClick={() => window.history.back()}
              className="press flex h-11 w-11 items-center justify-center rounded-2xl bg-card shadow-soft"
              aria-label="Back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : config?.photo_url ? (
            <AppImage
              src={config.photo_url}
              alt={pick(lang, config.rep_name_mr, config.rep_name_en)}
              position="top"
              className="h-12 w-12 shrink-0 rounded-2xl ring-2 ring-primary/25"
            />
          ) : null}

          <div className="min-w-0 flex-1">
            {title ? (
              <>
                <p className="truncate text-lg font-extrabold leading-tight">{title}</p>
                {subtitle ? (
                  <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
                ) : null}
              </>
            ) : (
              <>
                <p className="truncate text-[15px] font-extrabold leading-tight">
                  {config ? pick(lang, config.rep_name_mr, config.rep_name_en) : ""}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {config ? pick(lang, config.ward_mr, config.ward_en) : ""}
                </p>
              </>
            )}
          </div>

          {!back ? (
            <AppImage
              src="/branding/bjp-lotus.webp"
              alt="Bharatiya Janata Party lotus"
              priority
              className="h-9 w-9 shrink-0 rounded-full bg-card"
            />
          ) : null}

          <Link
            to="/updates"
            aria-label={t("updates")}
            className="press relative flex h-11 w-11 items-center justify-center rounded-2xl bg-card shadow-soft"
          >
            <Bell className="h-5 w-5 text-primary" />
            {unread > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {unread}
              </span>
            ) : null}
          </Link>

          <LangToggle />
        </div>

        {!title ? (
          <p className="mt-3 text-xl font-extrabold leading-tight">
            {t("greeting")}, {profile.name} 🙏
          </p>
        ) : null}
      </header>

      <main className="mx-auto max-w-md px-5 py-4">{children(profile)}</main>
      <footer className="mx-auto flex max-w-md items-center justify-center gap-2 px-5 pb-4 text-xs font-semibold text-muted-foreground">
        <AppImage src="/branding/bjp-lotus.webp" alt="BJP lotus" className="h-7 w-7 rounded-full" />
        <span>जनसेवा • विकास • विश्वास</span>
      </footer>
      <BottomNav />
    </div>
  );
}
