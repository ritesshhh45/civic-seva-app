/**
 * Single, hardened native notification flow.
 *
 * Called exactly once, right after the citizen registers (login submit).
 * Statically imports the Capacitor plugins so the permission dialog can never
 * be skipped because a lazy chunk failed to load inside the APK webview.
 * Every step is guarded: native-platform check, plugin availability,
 * listeners attached only once, Android 13+ POST_NOTIFICATIONS handled,
 * registration and token storage fully non-blocking. This function never
 * throws, never navigates, never reloads, and never uses the browser
 * Notification API.
 */

import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { LocalNotifications } from "@capacitor/local-notifications";

import { getDeviceId } from "./device";
import { savePushToken } from "./citizen";

export type PushResult = "native" | "unsupported" | "denied" | "unavailable";

let inflight: Promise<PushResult> | null = null;
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

async function attachListeners(platform: string) {
  if (listenersAttached) return;
  listenersAttached = true;
  try {
    await PushNotifications.addListener("registration", (token) => {
      // Fire-and-forget: token storage must never affect the UI.
      try {
        void savePushToken(getDeviceId(), token?.value ?? "", platform).catch(() => {});
      } catch {
        /* ignore */
      }
    });
    await PushNotifications.addListener("registrationError", () => {
      /* FCM/google-services missing — notifications simply stay off. */
    });
    await PushNotifications.addListener("pushNotificationReceived", () => {
      /* delivery handled by the OS tray */
    });
    await PushNotifications.addListener("pushNotificationActionPerformed", () => {
      /* deliberately no navigation / no reload from this callback */
    });
  } catch {
    /* listener API unavailable — continue without it */
  }
}

/**
 * Asks the OS for the POST_NOTIFICATIONS runtime permission.
 * Prefers PushNotifications; falls back to LocalNotifications (same Android
 * runtime permission) if the push plugin is not available in the build.
 */
async function ensurePermission(): Promise<string> {
  let state = "prompt";

  if (Capacitor.isPluginAvailable("PushNotifications")) {
    state = await safe(
      PushNotifications.checkPermissions().then((r) => r?.receive ?? "prompt"),
      "prompt" as string,
    );
    if (state === "prompt" || state === "prompt-with-rationale") {
      state = await safe(
        PushNotifications.requestPermissions().then((r) => r?.receive ?? "denied"),
        "denied" as string,
        60000,
      );
    }
    if (state === "granted") return state;
  }

  // Fallback path: identical Android 13+ system dialog via LocalNotifications.
  if (state !== "denied" && Capacitor.isPluginAvailable("LocalNotifications")) {
    const local = await safe(
      LocalNotifications.checkPermissions().then((r) => r?.display ?? "prompt"),
      "prompt" as string,
    );
    if (local === "prompt" || local === "prompt-with-rationale") {
      return await safe(
        LocalNotifications.requestPermissions().then((r) => r?.display ?? "denied"),
        "denied" as string,
        60000,
      );
    }
    return local;
  }

  return state;
}

/**
 * Requests notification permission once and registers for push if allowed.
 * Resolves with what happened; it never rejects. Allow and Deny both simply
 * resolve so the caller can continue to Home identically.
 */
export function initNotifications(): Promise<PushResult> {
  if (inflight) return inflight;
  inflight = run();
  return inflight;
}

async function run(): Promise<PushResult> {
  try {
    if (!Capacitor?.isNativePlatform?.()) return "unsupported";

    const platform = Capacitor.getPlatform();
    if (platform !== "android" && platform !== "ios") return "unsupported";

    if (Capacitor.isPluginAvailable("PushNotifications")) {
      await attachListeners(platform);
    }

    // Native runtime permission dialog (Android 13+ / iOS), asked at most once.
    const receive = await ensurePermission();

    // Deny / permanently denied: continue normally, notifications stay off.
    if (receive !== "granted") return "denied";

    if (!Capacitor.isPluginAvailable("PushNotifications")) return "unavailable";

    // Allow: register, but a missing google-services.json must not crash.
    const registered = await safe(
      PushNotifications.register().then(() => true),
      false,
    );
    return registered ? "native" : "unavailable";
  } catch {
    return "unavailable";
  }
}
