import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Phone, MessageCircle, LogOut, Shield, ListChecks, MapPin, PlayCircle } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { clearProfile } from "@/lib/device";
import { configQuery, galleryQuery, waLink } from "@/lib/queries";
import { adminMe } from "@/lib/admin";
import { AppImage } from "@/components/AppImage";
import { pick, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Sanjay Chaudhary Ward Seva App" },
      { name: "description", content: "Your saved details, ward office contact, photos and videos." },
      { property: "og:title", content: "Profile — Sanjay Chaudhary Ward Seva App" },
      { property: "og:description", content: "Your details, ward contacts and media gallery." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const { data: config } = useQuery(configQuery);
  const { data: gallery } = useQuery(galleryQuery);

  const { data: me } = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => adminMe(),
    retry: false,
  });
  const isAdmin = me?.status === "approved";

  const photos = (gallery ?? []).filter((g) => g.media_type !== "video");
  const videos = (gallery ?? []).filter((g) => g.media_type === "video");

  return (
    <AppLayout title={t("profile")}>
      {(profile) => (
        <div className="space-y-5">
          <section className="glass-card p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {t("savedInfo")}
            </p>
            <p className="mt-2 text-lg font-extrabold">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{profile.mobile}</p>
          </section>

          <section className="card-premium space-y-3 p-5">
            <p className="font-bold">
              {config ? pick(lang, config.rep_name_mr, config.rep_name_en) : ""}
            </p>
            {config && pick(lang, config.office_address_mr, config.office_address_en) ? (
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {pick(lang, config.office_address_mr, config.office_address_en)}
              </p>
            ) : null}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${config?.phone ?? ""}`}
                className="press flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground"
              >
                <Phone className="h-4 w-4" /> {t("call")}
              </a>
              <a
                href={waLink(config?.whatsapp ?? "", "नमस्कार साहेब 🙏")}
                target="_blank"
                rel="noreferrer"
                className="press flex items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-sm font-bold text-accent-foreground"
              >
                <MessageCircle className="h-4 w-4" /> {t("whatsapp")}
              </a>
            </div>
          </section>

          <Link to="/takrari" className="press card-premium flex items-center gap-3 p-4 text-sm font-bold">
            <ListChecks className="h-5 w-5 text-primary" /> {t("myComplaints")}
          </Link>

          {photos.length > 0 ? (
            <section>
              <h2 className="mb-3 text-base font-extrabold">{t("photos")}</h2>
              <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5">
                {photos.map((g) => (
                  <figure key={g.id} className="w-44 shrink-0">
                    <AppImage
                      src={g.image_url}
                      alt={pick(lang, g.title_mr, g.title_en)}
                      className="h-32 w-44 rounded-3xl shadow-soft"
                    />
                    <figcaption className="mt-1.5 text-xs text-muted-foreground">
                      {pick(lang, g.title_mr, g.title_en)}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          ) : null}

          {videos.length > 0 ? (
            <section>
              <h2 className="mb-3 text-base font-extrabold">{t("videos")}</h2>
              <div className="space-y-3">
                {videos.map((g) => (
                  <a
                    key={g.id}
                    href={g.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="press card-premium flex items-center gap-3 p-3"
                  >
                    {g.image_url ? (
                      <AppImage src={g.image_url} alt="" className="h-16 w-24 rounded-2xl" />
                    ) : (
                      <span className="flex h-16 w-24 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                        <PlayCircle className="h-6 w-6" />
                      </span>
                    )}
                    <span className="text-sm font-bold">{pick(lang, g.title_mr, g.title_en)}</span>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {isAdmin ? (
            <Link to="/admin" className="press card-premium flex items-center gap-3 p-4 text-sm font-bold">
              <Shield className="h-5 w-5 text-primary" /> {t("admin")}
            </Link>
          ) : null}

          <button
            onClick={() => {
              clearProfile();
              navigate({ to: "/" });
            }}
            className="press flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 py-3 text-sm font-bold text-destructive"
          >
            <LogOut className="h-4 w-4" /> {t("logout")}
          </button>
        </div>
      )}
    </AppLayout>
  );
}
