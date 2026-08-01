import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TriangleAlert } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { AppImage } from "@/components/AppImage";
import { updatesQuery } from "@/lib/queries";
import { pick, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/updates/$updateId")({
  head: () => ({
    meta: [
      { title: "Update — Sanjay Chaudhary Ward Seva App" },
      { name: "description", content: "Full details of this ward announcement." },
      { property: "og:title", content: "Update — Sanjay Chaudhary Ward Seva App" },
      { property: "og:description", content: "Full details of this ward announcement." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UpdateDetail,
});

function UpdateDetail() {
  const { updateId } = Route.useParams();
  const { lang, t } = useLang();
  const { data } = useQuery(updatesQuery);
  const u = (data ?? []).find((x) => x.id === updateId);

  return (
    <AppLayout back title={t("updates")}>
      {() =>
        !u ? (
          <p className="card-premium p-6 text-center text-sm text-muted-foreground">
            {t("noUpdates")}
          </p>
        ) : (
          <article className="card-premium animate-rise overflow-hidden">
            {u.image_url ? <AppImage src={u.image_url} alt="" className="h-52 w-full" /> : null}
            <div className="space-y-3 p-5">
              <div className="flex flex-wrap items-center gap-2">
                {u.is_important ? (
                  <span className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">
                    <TriangleAlert className="h-3.5 w-3.5" /> {t("important")}
                  </span>
                ) : null}
                <span className="rounded-full bg-primary/12 px-3 py-1 text-[11px] font-bold text-primary">
                  {pick(lang, u.category_mr, u.category_en) || t("updates")}
                </span>
              </div>
              <h1 className="text-xl font-extrabold leading-snug">
                {pick(lang, u.title_mr, u.title_en)}
              </h1>
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground/90">
                {pick(lang, u.body_mr, u.body_en)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {new Date(u.publish_at).toLocaleString(lang === "mr" ? "mr-IN" : "en-IN")}
              </p>
            </div>
          </article>
        )
      }
    </AppLayout>
  );
}
