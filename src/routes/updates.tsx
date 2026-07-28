import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Pin, TriangleAlert } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { updatesQuery } from "@/lib/queries";
import { pick, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/updates")({
  head: () => ({
    meta: [
      { title: "Updates — Sanjay Chaudhary Ward Seva App" },
      { name: "description", content: "Ward announcements, alerts and notices from your representative." },
      { property: "og:title", content: "Updates — Sanjay Chaudhary Ward Seva App" },
      { property: "og:description", content: "Latest ward announcements and alerts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UpdatesPage,
});

function UpdatesPage() {
  const { lang, t } = useLang();
  const { data } = useQuery(updatesQuery);
  const rows = data ?? [];

  return (
    <AppLayout title={t("updates")}>
      {() => (
        <div className="space-y-4">
          {rows.length === 0 ? (
            <p className="card-premium p-6 text-center text-sm text-muted-foreground">
              {t("noUpdates")}
            </p>
          ) : (
            rows.map((u) => (
              <Link
                key={u.id}
                to="/updates/$updateId"
                params={{ updateId: u.id }}
                className="press card-premium animate-rise block overflow-hidden"
              >
                {u.image_url ? <img src={u.image_url} alt="" className="h-36 w-full object-cover" /> : null}
                <div className="space-y-1.5 p-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {u.is_important ? (
                      <span className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                        <TriangleAlert className="h-3 w-3" /> {t("important")}
                      </span>
                    ) : null}
                    {u.is_pinned ? <Pin className="h-3.5 w-3.5 text-primary" /> : null}
                    <span className="rounded-full bg-primary/12 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                      {pick(lang, u.category_mr, u.category_en) || t("updates")}
                    </span>
                  </div>
                  <p className="text-base font-extrabold leading-snug">
                    {pick(lang, u.title_mr, u.title_en)}
                  </p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {pick(lang, u.body_mr, u.body_en)}
                  </p>
                  <p className="pt-1 text-[11px] text-muted-foreground">
                    {new Date(u.publish_at).toLocaleString(lang === "mr" ? "mr-IN" : "en-IN")}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </AppLayout>
  );
}
