<<<<<<< HEAD
import { QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { LanguageProvider } from "../lib/i18n";
=======
import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { LanguageProvider } from "../lib/i18n";
import { initBackButton } from "../lib/backButton";
>>>>>>> a924290b6cad1e32c78c649ac7f6b31b4d81ad51

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
<<<<<<< HEAD
=======
  const router = useRouter();

  useEffect(() => {
    return initBackButton(router);
    // The root router is stable for the lifetime of the app; install its native listener once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
>>>>>>> a924290b6cad1e32c78c649ac7f6b31b4d81ad51

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </LanguageProvider>
    </QueryClientProvider>
  );
}
