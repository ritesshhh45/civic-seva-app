import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Phone, MessageCircle, LogOut, Shield } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { clearProfile } from "@/lib/device";
import { configQuery, waLink } from "@/lib/queries";
import { pick, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Sanjay Chaudhary Seva App" },
      { name: "description", content: "Your saved details and contact options for your ward office." },
      { property: "og:title", content: "Profile — Sanjay Chaudhary Seva App" },
      { property: "og:description", content: "Your saved details and ward contact options." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const { data: config } = useQuery(configQuery);

  return (
    <AppLayout>
      {(profile) => (
        <div className="space-y-5">
          <h1 className="text-xl font-extrabold">{t("profile")}</h1>

          <section className="card-soft p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {t("savedInfo")}
            </p>
            <p className="mt-2 text-lg font-bold">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{profile.mobile}</p>
          </section>

          <section className="card-soft space-y-3 p-5">
            <p className="font-bold">
              {config ? pick(lang, config.rep_name_mr, config.rep_name_en) : ""}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${config?.phone ?? ""}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"
              >
                <Phone className="h-4 w-4" /> {t("call")}
              </a>
              <a
                href={waLink(config?.whatsapp ?? "", "नमस्कार साहेब,")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-bold text-accent-foreground"
              >
                <MessageCircle className="h-4 w-4" /> {t("whatsapp")}
              </a>
            </div>
          </section>

          <Link
            to="/admin"
            className="card-soft flex items-center gap-3 p-4 text-sm font-semibold"
          >
            <Shield className="h-4 w-4 text-primary" /> {t("admin")}
          </Link>

          <button
            onClick={() => {
              clearProfile();
              navigate({ to: "/" });
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 py-3 text-sm font-bold text-destructive"
          >
            <LogOut className="h-4 w-4" /> {t("logout")}
          </button>
        </div>
      )}
    </AppLayout>
  );
}
