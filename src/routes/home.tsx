import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Phone, MessageCircle } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { CategoryIcon } from "@/components/CategoryIcon";
import { categoriesQuery, configQuery, galleryQuery, waLink } from "@/lib/queries";
import { pick, useLang } from "@/lib/i18n";
import { getDeviceId } from "@/lib/device";
import { logTap } from "@/lib/api.functions";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — Sanjay Chaudhary Seva App" },
      {
        name: "description",
        content: "Tap a category to send your civic complaint straight to your nagarsevak on WhatsApp.",
      },
      { property: "og:title", content: "Home — Sanjay Chaudhary Seva App" },
      { property: "og:description", content: "One tap civic complaints for your ward." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { lang, t } = useLang();
  const { data: config } = useQuery(configQuery);
  const { data: categories } = useQuery(categoriesQuery);
  const { data: gallery } = useQuery(galleryQuery);
  const tap = useServerFn(logTap);

  return (
    <AppLayout>
      {(profile) => {
        const active = (categories ?? []).filter((c) => c.is_active);

        const openCategory = async (id: string, nameLabel: string, message: string) => {
          const url = waLink(config?.whatsapp ?? "", message);
          const win = window.open(url, "_blank");
          try {
            await tap({
              data: {
                deviceId: getDeviceId(),
                name: profile.name,
                mobile: profile.mobile,
                categoryId: id,
                categoryName: nameLabel,
              },
            });
          } catch {
            /* logging must never block the user */
          }
          if (!win) window.location.href = url;
        };

        return (
          <div className="space-y-6">
            <section className="card-soft overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                {config?.photo_url ? (
                  <img
                    src={config.photo_url}
                    alt={pick(lang, config.rep_name_mr, config.rep_name_en)}
                    className="h-20 w-20 rounded-2xl object-cover object-top"
                  />
                ) : null}
                <div className="min-w-0">
                  <h1 className="text-lg font-extrabold leading-tight">
                    {config ? pick(lang, config.rep_name_mr, config.rep_name_en) : ""}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {config ? pick(lang, config.tagline_mr, config.tagline_en) : ""}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 px-4 pb-4">
                <a
                  href={`tel:${config?.phone ?? ""}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-soft"
                >
                  <Phone className="h-4 w-4" /> {t("call")}
                </a>
                <a
                  href={waLink(config?.whatsapp ?? "", "नमस्कार साहेब,")}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-bold text-accent-foreground shadow-soft"
                >
                  <MessageCircle className="h-4 w-4" /> {t("whatsapp")}
                </a>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                {t("pickCategory")}
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {active.map((c) => {
                  const label = pick(lang, c.name_mr, c.name_en);
                  return (
                    <button
                      key={c.id}
                      onClick={() =>
                        openCategory(c.id, label, pick(lang, c.message_mr, c.message_en))
                      }
                      className="card-soft flex min-h-[104px] flex-col items-center justify-center gap-2 px-2 py-3 text-center active:scale-[0.97]"
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/12 text-primary">
                        <CategoryIcon name={c.icon} className="h-6 w-6" />
                      </span>
                      <span className="text-xs font-semibold leading-tight">{label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {gallery && gallery.length > 0 ? (
              <section>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  {t("gallery")}
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {gallery.map((g) => (
                    <figure key={g.id} className="w-40 shrink-0">
                      <img
                        src={g.image_url}
                        alt={pick(lang, g.title_mr, g.title_en)}
                        className="h-28 w-40 rounded-2xl object-cover shadow-soft"
                      />
                      <figcaption className="mt-1 text-xs text-muted-foreground">
                        {pick(lang, g.title_mr, g.title_en)}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        );
      }}
    </AppLayout>
  );
}
