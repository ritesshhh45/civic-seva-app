import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Landmark, ExternalLink, CalendarClock } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { AppImage } from "@/components/AppImage";
import { schemesQuery } from "@/lib/queries";
import { pick, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/schemes/$schemeId")({
  head: () => ({
    meta: [
      { title: "Scheme details — Ward Seva App" },
      {
        name: "description",
        content:
          "Eligibility, required documents, benefits and the official apply link for this government scheme.",
      },
      { property: "og:title", content: "Scheme details — Ward Seva App" },
      {
        property: "og:description",
        content: "Eligibility, documents, benefits and official apply link.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SchemeDetail,
});

function Block({ title, body }: { title: string; body: string }) {
  if (!body) return null;
  return (
    <section className="card-premium p-4">
      <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed">{body}</p>
    </section>
  );
}

function SchemeDetail() {
  const { schemeId } = Route.useParams();
  const { lang, t } = useLang();
  const { data } = useQuery(schemesQuery);
  const s = (data ?? []).find((x) => x.id === schemeId);

  return (
    <AppLayout back title={s ? pick(lang, s.name_mr, s.name_en) : t("schemes")}>
      {() =>
        !s ? (
          <p className="card-premium p-6 text-center text-sm text-muted-foreground">
            {t("noSchemes")}
          </p>
        ) : (
          <div className="space-y-4 pb-6">
            <div className="card-premium animate-rise overflow-hidden">
              {s.banner_url ? (
                <AppImage src={s.banner_url} alt="" className="h-40 w-full" />
              ) : (
                <div className="saffron-gradient h-24 w-full" />
              )}
              <div className="flex items-center gap-3 p-4">
                {s.logo_url ? (
                  <AppImage src={s.logo_url} alt="" className="h-14 w-14 rounded-2xl" />
                ) : (
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <Landmark className="h-6 w-6" />
                  </span>
                )}
                <div>
                  <h1 className="text-lg font-extrabold leading-tight">
                    {pick(lang, s.name_mr, s.name_en)}
                  </h1>
                  <p className="text-xs font-semibold text-primary">
                    {pick(lang, s.category_mr, s.category_en)}
                  </p>
                </div>
              </div>
            </div>

            <Block title={t("updates")} body={pick(lang, s.desc_mr, s.desc_en)} />
            <Block title={t("eligibility")} body={pick(lang, s.eligibility_mr, s.eligibility_en)} />
            <Block title={t("documents")} body={pick(lang, s.documents_mr, s.documents_en)} />
            <Block title={t("benefits")} body={pick(lang, s.benefits_mr, s.benefits_en)} />

            {s.last_date ? (
              <p className="flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-bold text-primary">
                <CalendarClock className="h-4 w-4" /> {t("lastDate")}: {s.last_date}
              </p>
            ) : null}

            {s.website_url ? (
              <a
                href={s.website_url}
                target="_blank"
                rel="noreferrer"
                className="press saffron-gradient flex items-center justify-center gap-2 rounded-3xl py-4 text-sm font-extrabold text-primary-foreground shadow-card"
              >
                {t("applyNow")} <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        )
      }
    </AppLayout>
  );
}
