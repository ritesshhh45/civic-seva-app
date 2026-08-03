/**
 * Notification setup that can never take the app down.
 *
 * Every step is guarded: platform check, Android 13+ runtime permission check,
 * graceful skip when Firebase/FCM is not configured, and a hard try/catch around
 * registration. The caller can safely ignore the result.
 */

export type PushResult = "native" | "web" | "unsupported" | "denied" | "unavailable";

let started = false;

async function setupNative(): Promise<PushResult> {
  const { PushNotifications } = await import("@capacitor/push-notifications");

  // Listeners first, so a registration error is reported instead of thrown.
  try {
    await PushNotifications.addListener("registrationError", () => {
      /* FCM not configured on this build — notifications simply stay off. */
    });
  } catch {
    /* listener API unavailable — continue */
  }

  let receive: string;
  try {
    receive = (await PushNotifications.checkPermissions()).receive;
  } catch {
    return "unavailable";
  }

  if (receive === "prompt" || receive === "prompt-with-rationale") {
    try {
      receive = (await PushNotifications.requestPermissions()).receive;
    } catch {
      return "unavailable";
    }
  }

  // Covers denied and permanently denied ("denied" is terminal on Android 13+).
  if (receive !== "granted") return "denied";

  try {
    await PushNotifications.register();
  } catch {
    // No google-services.json / FCM sender id — skip push, keep the app running.
    return "unavailable";
  }

  return "native";
}

/**
 * Call this only once the UI is mounted — never during startup.
 * Resolves with what happened; it never rejects.
 */
export async function initNotifications(): Promise<PushResult> {
  if (started) return "unsupported";
  started = true;

  try {
    const { Capacitor } = await import("@capacitor/core");

    if (Capacitor.isNativePlatform()) {
      if (Capacitor.getPlatform() !== "android" && Capacitor.getPlatform() !== "ios") {
        return "unsupported";
      }
      if (!Capacitor.isPluginAvailable("PushNotifications")) return "unavailable";
      return await setupNative();
    }

    if (typeof Notification === "undefined") return "unsupported";
    if (Notification.permission === "granted") return "web";
    if (Notification.permission === "denied") return "denied";
    const res = await Notification.requestPermission();
    return res === "granted" ? "web" : "denied";
  } catch {
    return "unavailable";
  }
}
