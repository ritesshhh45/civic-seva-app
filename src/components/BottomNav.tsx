import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ListChecks, Bell, User } from "lucide-react";
import { useLang } from "@/lib/i18n";

export function BottomNav() {
  const { t } = useLang();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const items = [
    { to: "/home", label: t("home"), Icon: Home },
    { to: "/takrari", label: t("complaints"), Icon: ListChecks },
    { to: "/updates", label: t("updates"), Icon: Bell },
    { to: "/profile", label: t("profile"), Icon: User },
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ to, label, Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                  active ? "bg-primary/12" : ""
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
