import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  Phone,
  MessageCircle,
  MapPin,
  TriangleAlert,
  ArrowRight,
  ChevronRight,
  Landmark,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { AppImage } from "@/components/AppImage";
import { WorkIcon } from "@/components/CategoryIcon";
import { initNotifications } from "@/lib/push";
import {
  configQuery,
  galleryQuery,
  schemesQuery,
  updatesQuery,
  waLink,
  worksQuery,
} from "@/lib/queries";
import { pick, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — Sanjay Chaudhary Ward Seva App" },
      {
        name: "description",
        content:
          "Ward updates, development works and one-tap civic complaints straight to your nagarsevak on WhatsApp.",
      },
      { property: "og:title", content: "Home — Sanjay Chaudhary Ward Seva App" },
      { property: "og:description", content: "Ward updates and one-tap civic complaints." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { lang, t } = useLang();
  const { data: config } = useQuery(configQuery);
  const { data: updates } = useQuery(updatesQuery);
  const { data: works } = useQuery(worksQuery);
  const { data: schemes } = useQuery(schemesQuery);
  const { data: gallery } = useQuery(galleryQuery);

  const list = updates ?? [];
  const alert = list.find((u) => u.is_important);
  const cards = list.slice(0, 8);
  const activeWorks = (works ?? []).filter((w) => w.is_active);
  const activeSchemes = (schemes ?? []).filter((s) => s.is_active);
  const photos = (gallery ?? []).filter((g) => g.media_type !== "video");

  return (
    <AppLayout>
      {() => (
        <div className="space-y-6">
          {alert ? (
            <Link
              to="/updates/$updateId"
              params={{ updateId: alert.id }}
              className="press animate-rise saffron-gradient flex items-start gap-3 rounded-3xl p-4 text-primary-foreground shadow-card"
            >
              <TriangleAlert className="mt-0.5 h-6 w-6 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide opacity-90">
                  {t("important")}
                </p>
                <p className="mt-0.5 text-sm font-bold leading-snug">
                  {pick(lang, alert.title_mr, alert.title_en)}
                </p>
                <p className="mt-1 text-[13px] leading-snug opacity-95">
                  {pick(lang, alert.body_mr, alert.body_en)}
                </p>
              </div>
            </Link>
          ) : null}

          {/* Hero card */}
          <section className="glass-card animate-rise overflow-hidden">
            <div className="flex items-center gap-4 p-5">
              <AppImage
                src={config?.header_photo_url || config?.photo_url}
                alt={config ? pick(lang, config.rep_name_mr, config.rep_name_en) : ""}
                position="top"
                fallback="none"
                priority
                className="h-24 w-24 shrink-0 rounded-3xl shadow-soft ring-1 ring-primary/15"
              />

              <div className="min-w-0">
                <h1 className="text-xl font-extrabold leading-tight">
                  {config ? pick(lang, config.rep_name_mr, config.rep_name_en) : ""}
                </h1>
                <p className="text-sm font-semibold text-primary">
                  {config ? pick(lang, config.ward_mr, config.ward_en) : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {config ? pick(lang, config.party_name_mr, config.party_name_en) : ""}
                </p>
                <p className="mt-1.5 text-[13px] font-semibold leading-snug text-secondary-foreground">
                  “{config ? pick(lang, config.slogan_mr, config.slogan_en) : ""}”
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 px-5 pb-5">
              <a
                href={`tel:${config?.phone ?? ""}`}
                className="press flex flex-col items-center gap-1 rounded-2xl bg-primary py-3.5 text-[11px] font-bold text-primary-foreground shadow-soft"
              >
                <Phone className="h-5 w-5" /> {t("call")}
              </a>
              <a
                href={waLink(config?.whatsapp ?? "", "नमस्कार साहेब 🙏")}
                target="_blank"
                rel="noreferrer"
                className="press flex flex-col items-center gap-1 rounded-2xl bg-accent py-3.5 text-[11px] font-bold text-accent-foreground shadow-soft"
              >
                <MessageCircle className="h-5 w-5" /> {t("whatsapp")}
              </a>
              <a
                href={
                  config?.office_map_url ||
                  `https://www.google.com/maps/search/${encodeURIComponent(
                    config?.office_address_en || config?.office_address_mr || "ward office",
                  )}`
                }
                target="_blank"
                rel="noreferrer"
                className="press leaf-soft flex flex-col items-center gap-1 rounded-2xl py-3.5 text-[11px] font-bold text-secondary-foreground shadow-soft"
              >
                <MapPin className="h-5 w-5" /> {t("office")}
              </a>
            </div>
          </section>

          {/* Daily updates */}
          <section className="animate-rise">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-extrabold">{t("todayUpdates")}</h2>
              <Link
                to="/updates"
                className="flex items-center gap-1 text-xs font-bold text-primary"
              >
                {t("viewAll")} <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {cards.length === 0 ? (
              <p className="card-premium p-6 text-center text-sm text-muted-foreground">
                {t("noUpdates")}
              </p>
            ) : (
              <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-1">
                {cards.map((u) => (
                  <Link
                    key={u.id}
                    to="/updates/$updateId"
                    params={{ updateId: u.id }}
                    className="press card-premium w-[75%] shrink-0 snap-start overflow-hidden"
                  >
                    {u.image_url ? (
                      <AppImage src={u.image_url} alt="" className="h-32 w-full" />
                    ) : (
                      <div className="saffron-gradient h-20 w-full opacity-90" />
                    )}
                    <div className="space-y-1.5 p-4">
                      <span className="inline-block rounded-full bg-primary/12 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                        {pick(lang, u.category_mr, u.category_en) || t("updates")}
                      </span>
                      <p className="text-sm font-bold leading-snug">
                        {pick(lang, u.title_mr, u.title_en)}
                      </p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {pick(lang, u.body_mr, u.body_en)}
                      </p>
                      <p className="pt-1 text-[10px] text-muted-foreground">
                        {new Date(u.publish_at).toLocaleDateString(
                          lang === "mr" ? "mr-IN" : "en-IN",
                        )}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Development works */}
          {activeWorks.length > 0 ? (
            <section className="animate-rise">
              <h2 className="mb-3 text-base font-extrabold">{t("devWorks")}</h2>
              <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
                {activeWorks.map((w) => (
                  <article key={w.id} className="card-premium w-40 shrink-0 overflow-hidden">
                    {w.image_url ? (
                      <AppImage src={w.image_url} alt="" className="h-24 w-full" />
                    ) : (
                      <div className="leaf-soft flex h-24 w-full items-center justify-center text-accent">
                        <CategoryIcon name={w.icon} className="h-8 w-8" />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-sm font-bold leading-tight">
                        {pick(lang, w.title_mr, w.title_en)}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                        {pick(lang, w.desc_mr, w.desc_en)}
                      </p>
                      {pick(lang, w.status_mr, w.status_en) ? (
                        <span className="mt-2 inline-block rounded-full bg-accent/12 px-2 py-0.5 text-[10px] font-bold text-accent">
                          {pick(lang, w.status_mr, w.status_en)}
                        </span>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {/* Complaint CTA */}
          <Link
            to="/services"
            className="press saffron-gradient animate-rise block rounded-3xl p-6 text-primary-foreground shadow-card"
          >
            <h2 className="text-xl font-extrabold">{t("complaintTitle")}</h2>
            <p className="mt-1 text-sm opacity-95">{t("complaintSub")}</p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-card px-5 py-3 text-sm font-extrabold text-primary shadow-soft">
              {t("chooseIssue")} <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          {/* Government schemes */}
          {activeSchemes.length > 0 ? (
            <section className="animate-rise">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-extrabold">{t("schemes")}</h2>
                <Link
                  to="/schemes"
                  className="flex items-center gap-1 text-xs font-bold text-primary"
                >
                  {t("viewAll")} <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
                {activeSchemes.slice(0, 8).map((s) => (
                  <Link
                    key={s.id}
                    to="/schemes/$schemeId"
                    params={{ schemeId: s.id }}
                    className="press card-premium w-44 shrink-0 p-4"
                  >
                    {s.logo_url ? (
                      <AppImage src={s.logo_url} alt="" className="h-10 w-10 rounded-xl" />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                        <Landmark className="h-5 w-5" />
                      </span>
                    )}
                    <p className="mt-2 text-sm font-bold leading-tight">
                      {pick(lang, s.name_mr, s.name_en)}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                      {pick(lang, s.desc_mr, s.desc_en)}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {/* Gallery */}
          {photos.length > 0 ? (
            <section className="animate-rise">
              <h2 className="mb-3 text-base font-extrabold">{t("gallery")}</h2>
              <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
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
        </div>
      )}
    </AppLayout>
  );
}
