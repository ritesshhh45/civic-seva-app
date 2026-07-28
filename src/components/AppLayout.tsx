import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getProfile, type Profile } from "@/lib/device";
import { configQuery } from "@/lib/queries";
import { BottomNav } from "./BottomNav";
import { LangToggle } from "./LangToggle";
import { pick, useLang } from "@/lib/i18n";

export function AppLayout({ children }: { children: (profile: Profile) => ReactNode }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  const { lang } = useLang();
  const { data: config } = useQuery(configQuery);

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
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="tricolor-bar h-1.5 w-full" />
      <header className="mx-auto flex max-w-md items-center gap-3 px-4 pt-3">
        {config?.party_logo_url ? (
          <img
            src={config.party_logo_url}
            alt="Party logo"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/25"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold leading-tight">
            {config ? pick(lang, config.rep_name_mr, config.rep_name_en) : ""}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {config ? pick(lang, config.ward_mr, config.ward_en) : ""} ·{" "}
            {config ? pick(lang, config.party_name_mr, config.party_name_en) : ""}
          </p>
        </div>
        <LangToggle />
      </header>
      <main className="mx-auto max-w-md px-4 py-4">{children(profile)}</main>
      <BottomNav />
    </div>
  );
}
