import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { CategoryIcon } from "@/components/CategoryIcon";
import { categoriesQuery, configQuery, serviceMessage, waLink } from "@/lib/queries";
import { pick, useLang } from "@/lib/i18n";
import { getDeviceId } from "@/lib/device";
import { logComplaintTap } from "@/lib/citizen";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Sanjay Chaudhary Ward Seva App" },
      {
        name: "description",
        content:
          "Pick a civic service — water, roads, garbage, drainage, street lights — and send it to your nagarsevak on WhatsApp.",
      },
      { property: "og:title", content: "Services — Sanjay Chaudhary Ward Seva App" },
      { property: "og:description", content: "One-tap civic service requests over WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { lang, t } = useLang();
  const { data: config } = useQuery(configQuery);
  const { data: categories } = useQuery(categoriesQuery);

  return (
<<<<<<< HEAD
    <AppLayout title={t("services")} subtitle={t("servicesSub")}>
=======
    <AppLayout title={t("services")} subtitle={t("servicesSub")} back>
>>>>>>> a924290b6cad1e32c78c649ac7f6b31b4d81ad51
      {(profile) => {
        const active = (categories ?? []).filter((c) => c.is_active);

        const open = async (id: string, label: string, body: string) => {
          const url = waLink(
            config?.whatsapp ?? "",
            serviceMessage({
              name: profile.name,
              mobile: profile.mobile,
              service: label,
              body,
              lang,
            }),
          );
          const win = window.open(url, "_blank");
          try {
            await logComplaintTap({
              deviceId: getDeviceId(),
              name: profile.name,
              mobile: profile.mobile,
              categoryId: id,
              categoryName: label,
            });
          } catch {
            /* logging must never block the citizen */
          }
          if (!win) window.location.href = url;
        };

        return (
          <div className="grid grid-cols-2 gap-4">
            {active.map((c) => {
              const label = pick(lang, c.name_mr, c.name_en);
              return (
                <button
                  key={c.id}
                  onClick={() => open(c.id, label, pick(lang, c.message_mr, c.message_en))}
                  className="press card-premium animate-rise flex min-h-[132px] flex-col items-center justify-center gap-3 p-4 text-center"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <CategoryIcon name={c.icon} className="h-7 w-7" />
                  </span>
                  <span className="text-sm font-bold leading-tight">{label}</span>
                </button>
              );
            })}
          </div>
        );
      }}
    </AppLayout>
  );
}
