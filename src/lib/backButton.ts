import { App } from "@capacitor/app";
import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import type { getRouter } from "@/router";

type AppRouter = ReturnType<typeof getRouter>;

let activeRouter: AppRouter | null = null;
let activeConsumers = 0;
let listenerPromise: Promise<void> | null = null;
let listenerHandle: PluginListenerHandle | null = null;
let lastHomeBackAt = 0;
let toastElement: HTMLDivElement | null = null;
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function clearToast() {
  try {
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = null;
    toastElement?.remove();
    toastElement = null;
  } catch {
    // Toast cleanup must never interrupt app navigation or exit.
  }
}

function showExitToast() {
  try {
    clearToast();
    const toast = document.createElement("div");
    toast.className =
      "fixed bottom-24 left-1/2 z-[100] -translate-x-1/2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.textContent = "Press back again to exit";
    document.body.appendChild(toast);
    toastElement = toast;
    toastTimer = setTimeout(clearToast, 2000);
  } catch {
    // The native back handler still works if the optional toast cannot be displayed.
  }
}

function handleBackPress() {
  try {
    const router = activeRouter;
    if (!router) return;

    const pathname = router.state.location.pathname;
    if (pathname === "/") {
      clearToast();
      void App.exitApp().catch(() => undefined);
      return;
    }

    if (pathname === "/home") {
      const now = Date.now();
      if (lastHomeBackAt > 0 && now - lastHomeBackAt <= 2000) {
        lastHomeBackAt = 0;
        clearToast();
        void App.exitApp().catch(() => undefined);
        return;
      }

      lastHomeBackAt = now;
      showExitToast();
      return;
    }

    if (router.history.canGoBack()) {
      router.history.back();
    } else {
      void router.navigate({ to: "/home" });
    }
  } catch {
    // Hardware back is a best-effort convenience and must never crash the app.
  }
}

function ensureListener() {
  if (listenerPromise) return;

  try {
    listenerPromise = App.addListener("backButton", handleBackPress)
      .then((handle) => {
        if (activeConsumers === 0) {
          void handle.remove().catch(() => undefined);
          listenerPromise = null;
          return;
        }
        listenerHandle = handle;
      })
      .catch(() => {
        listenerHandle = null;
        listenerPromise = null;
      });
  } catch {
    listenerPromise = null;
  }
}

export function initBackButton(router: AppRouter): () => void {
  try {
    if (!Capacitor.isNativePlatform()) return () => undefined;

    activeRouter = router;
    activeConsumers += 1;
    ensureListener();

    let cleaned = false;
    return () => {
      if (cleaned) return;
      cleaned = true;

      try {
        activeConsumers = Math.max(0, activeConsumers - 1);
        if (activeConsumers > 0) return;

        activeRouter = null;
        lastHomeBackAt = 0;
        clearToast();

        const handle = listenerHandle;
        listenerHandle = null;
        if (handle) {
          listenerPromise = null;
          void handle.remove().catch(() => undefined);
        }
      } catch {
        // Listener cleanup must never interrupt React unmounting.
      }
    };
  } catch {
    return () => undefined;
  }
}