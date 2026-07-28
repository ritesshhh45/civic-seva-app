import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { notificationsQuery } from "@/lib/queries";
import { pick, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/updates")({
  head: () => ({
    meta: [
      { title: "Updates — Sanjay Chaudhary Seva App" },
      { name: "description", content: "Ward announcements and notices from your representative." },
      { property: "og:title", content: "Updates — Sanjay Chaudhary Seva App" },
      { property: "og:description", content: "Latest ward announcements and notices." },
    ],
  }),
  component: UpdatesPage,
});

function UpdatesPage() {
  const { lang, t } = useLang();
  const { data } = useQuery(notificationsQuery);

  return (
    <AppLayout>
      {() => (
        <div>
          <h1 className="mb-4 text-xl font-extrabold">{t("updates")}</h1>
          {!data || data.length === 0 ? (
            <p className="card-soft p-6 text-center text-sm text-muted-foreground">
              {t("noUpdates")}
            </p>
          ) : (
            <ul className="space-y-3">
              {data.map((n) => (
                <li key={n.id} className="card-soft flex gap-3 p-4">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                    <Bell className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-bold leading-tight">{pick(lang, n.title_mr, n.title_en)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {pick(lang, n.body_mr, n.body_en)}
                    </p>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {new Date(n.created_at).toLocaleString(lang === "mr" ? "mr-IN" : "en-IN")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </AppLayout>
  );
}
