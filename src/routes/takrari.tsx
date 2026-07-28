import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppLayout } from "@/components/AppLayout";
import { useLang } from "@/lib/i18n";
import { getDeviceId } from "@/lib/device";
import { myHistory } from "@/lib/api.functions";

export const Route = createFileRoute("/takrari")({
  head: () => ({
    meta: [
      { title: "My Complaints — Sanjay Chaudhary Seva App" },
      { name: "description", content: "See every civic complaint you have raised in your ward." },
      { property: "og:title", content: "My Complaints — Sanjay Chaudhary Seva App" },
      { property: "og:description", content: "Your personal complaint history." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { t, lang } = useLang();
  const fetchHistory = useServerFn(myHistory);
  const { data } = useQuery({
    queryKey: ["my-history"],
    queryFn: () => fetchHistory({ data: { deviceId: getDeviceId() } }),
  });

  return (
    <AppLayout>
      {() => (
        <div>
          <h1 className="mb-4 text-xl font-extrabold">{t("myComplaints")}</h1>
          {!data || data.length === 0 ? (
            <p className="card-soft p-6 text-center text-sm text-muted-foreground">
              {t("noComplaints")}
            </p>
          ) : (
            <ul className="space-y-3">
              {data.map((row) => (
                <li key={row.id} className="card-soft flex items-center justify-between p-4">
                  <span className="text-sm font-semibold">{row.category_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(row.created_at).toLocaleString(lang === "mr" ? "mr-IN" : "en-IN")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </AppLayout>
  );
}
