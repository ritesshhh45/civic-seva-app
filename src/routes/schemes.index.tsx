import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Landmark, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { AppImage } from "@/components/AppImage";
import { schemesQuery } from "@/lib/queries";
import { pick, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/schemes/")({
  head: () => ({
    meta: [
      { title: "Government Schemes — Ward Seva App" },
      {
        name: "description",
        content:
          "Browse central and Maharashtra government schemes with eligibility, documents and official apply links.",
      },
      { property: "og:title", content: "Government Schemes — Ward Seva App" },
      {
        property: "og:description",
        content: "Eligibility, documents and official apply links for government schemes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SchemesPage,
});

function SchemesPage() {
  const { lang, t } = useLang();
  const { data } = useQuery(schemesQuery);
  const [cat, setCat] = useState<string>("__all");

  const rows = (data ?? []).filter((s) => s.is_active);
  const cats = Array.from(
    new Set(rows.map((s) => pick(lang, s.category_mr, s.category_en)).filter(Boolean)),
  );
  const shown =
    cat === "__all" ? rows : rows.filter((s) => pick(lang, s.category_mr, s.category_en) === cat);

  return (
    <AppLayout title={t("schemes")} subtitle={t("schemesSub")} back>
      {() => (
        <div className="space-y-4">
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
            {[{ k: "__all", label: t("all") }, ...cats.map((c) => ({ k: c, label: c }))].map(
              (c) => (
                <button
                  key={c.k}
                  onClick={() => setCat(c.k)}
                  className={`press whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold ${
                    cat === c.k
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground shadow-soft"
                  }`}
                >
                  {c.label}
                </button>
              ),
            )}
          </div>

          {shown.length === 0 ? (
            <p className="card-premium p-6 text-center text-sm text-muted-foreground">
              {t("noSchemes")}
            </p>
          ) : (
            <ul className="space-y-4">
              {shown.map((s) => (
                <li key={s.id}>
                  <Link
                    to="/schemes/$schemeId"
                    params={{ schemeId: s.id }}
                    className="press card-premium animate-rise flex items-center gap-4 p-4"
                  >
                    {s.logo_url ? (
                      <AppImage src={s.logo_url} alt="" className="h-14 w-14 rounded-2xl" />
                    ) : (
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                        <Landmark className="h-6 w-6" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-sm font-extrabold leading-tight">
                          {pick(lang, s.name_mr, s.name_en)}
                        </p>
                        {s.is_new ? (
                          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                            {t("newTag")}
                          </span>
                        ) : null}
                        {s.is_featured ? (
                          <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-bold text-primary">
                            {t("featured")}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {pick(lang, s.desc_mr, s.desc_en)}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </AppLayout>
  );
}
