/**
 * Single, hardened native notification flow.
 *
 * Called exactly once, right after the citizen registers (login submit).
 * Every step is guarded: native-platform check, plugin availability,
 * listeners attached only once, Android 13+ POST_NOTIFICATIONS handled,
 * registration and token storage fully non-blocking. This function never
 * throws, never navigates, never reloads, and never uses the browser
 * Notification API.
 */

import { getDeviceId } from "./device";
import { savePushToken } from "./citizen";

export type PushResult = "native" | "unsupported" | "denied" | "unavailable";

let requested = false;
let listenersAttached = false;

/** Wrap any promise so it can neither reject nor hang the caller. */
function safe<T>(p: Promise<T>, fallback: T, ms = 8000): Promise<T> {
  return new Promise<T>((resolve) => {
    let done = false;
    const finish = (v: T) => {
      if (!done) {
        done = true;
        resolve(v);
      }
    };
    const timer = setTimeout(() => finish(fallback), ms);
    p.then((v) => {
      clearTimeout(timer);
      finish(v);
    }).catch(() => {
      clearTimeout(timer);
      finish(fallback);
    });
  });
}

type PushPlugin = typeof import("@capacitor/push-notifications")["PushNotifications"];

async function attachListeners(plugin: PushPlugin, platform: string) {
  if (listenersAttached) return;
  listenersAttached = true;
  try {
    await plugin.addListener("registration", (token) => {
      // Fire-and-forget: token storage must never affect the UI.
      try {
        void savePushToken(getDeviceId(), token?.value ?? "", platform).catch(() => {});
      } catch {
        /* ignore */
      }
    });
    await plugin.addListener("registrationError", () => {
      /* FCM/google-services missing — notifications simply stay off. */
    });
    await plugin.addListener("pushNotificationReceived", () => {
      /* delivery handled by the OS tray */
    });
    await plugin.addListener("pushNotificationActionPerformed", () => {
      /* deliberately no navigation / no reload from this callback */
    });
  } catch {
    /* listener API unavailable — continue without it */
  }
}

/**
 * Requests notification permission once and registers for push if allowed.
 * Resolves with what happened; it never rejects. Allow and Deny both simply
 * resolve so the caller can continue to Home identically.
 */
export async function initNotifications(): Promise<PushResult> {
  if (requested) return "unsupported";
  requested = true;

  try {
    const core = await import("@capacitor/core");
    const Capacitor = core.Capacitor;
    if (!Capacitor?.isNativePlatform?.()) return "unsupported";

    const platform = Capacitor.getPlatform();
    if (platform !== "android" && platform !== "ios") return "unsupported";
    if (!Capacitor.isPluginAvailable("PushNotifications")) return "unavailable";

    const mod = await import("@capacitor/push-notifications");
    const plugin = mod?.PushNotifications;
    if (!plugin) return "unavailable";

    await attachListeners(plugin, platform);

    // Current permission state.
    const checked = await safe(
      plugin.checkPermissions().then((r) => r?.receive ?? "prompt"),
      "prompt" as string,
    );
    let receive = checked;

    // Android 13+ / iOS runtime prompt — asked at most once per app session.
    if (receive === "prompt" || receive === "prompt-with-rationale") {
      receive = await safe(
        plugin.requestPermissions().then((r) => r?.receive ?? "denied"),
        "denied" as string,
        60000,
      );
    }

    // Deny / permanently denied: continue normally, notifications stay off.
    if (receive !== "granted") return "denied";

    // Allow: register, but a missing google-services.json must not crash.
    const registered = await safe(
      plugin.register().then(() => true),
      false,
    );
    return registered ? "native" : "unavailable";
  } catch {
    return "unavailable";
  }
}
