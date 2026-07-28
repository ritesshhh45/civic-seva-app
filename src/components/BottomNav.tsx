import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Home, LayoutGrid, Landmark, Bell, User, MessageCircle } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { configQuery, waLink } from "@/lib/queries";

export function BottomNav() {
  const { t } = useLang();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: config } = useQuery(configQuery);

  const left = [
    { to: "/home", label: t("home"), Icon: Home },
    { to: "/services", label: t("services"), Icon: LayoutGrid },
  ] as const;
  const right = [
    { to: "/updates", label: t("updates"), Icon: Bell },
    { to: "/profile", label: t("profile"), Icon: User },
  ] as const;

  const Item = ({ to, label, Icon }: { to: string; label: string; Icon: typeof Home }) => {
    const active = pathname === to || pathname.startsWith(`${to}/`);
    return (
      <Link
        to={to}
        className={`press flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold ${
          active ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-2xl transition-colors ${
            active ? "bg-primary/12" : ""
          }`}
        >
          <Icon className="h-5 w-5" strokeWidth={active ? 2.3 : 1.8} />
        </span>
        {label}
      </Link>
    );
  };

  return (
    <>
      <a
        href={waLink(config?.whatsapp ?? "", "नमस्कार साहेब 🙏")}
        target="_blank"
        rel="noreferrer"
        aria-label={t("whatsapp")}
        className="press fixed bottom-9 left-1/2 z-50 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[0_14px_30px_-10px_oklch(0.52_0.15_150/0.7)] ring-4 ring-background"
      >
        <MessageCircle className="h-7 w-7" />
      </a>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-stretch px-2 pb-[env(safe-area-inset-bottom)]">
          {left.map((i) => (
            <Item key={i.to} {...i} />
          ))}
          <Link
            to="/schemes"
            className={`press flex flex-1 flex-col items-center gap-0.5 pt-8 pb-2 text-[10px] font-semibold ${
              pathname.startsWith("/schemes") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <span className="sr-only">
              <Landmark className="h-4 w-4" />
            </span>
            {t("schemes")}
          </Link>
          {right.map((i) => (
            <Item key={i.to} {...i} />
          ))}
        </div>
      </nav>
    </>
  );
}
