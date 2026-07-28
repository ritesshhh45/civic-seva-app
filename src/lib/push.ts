/** Ask for notification permission as gently as possible, on native or web. */
export async function requestNotificationPermission() {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.isNativePlatform()) {
      const { PushNotifications } = await import("@capacitor/push-notifications");
      const status = await PushNotifications.checkPermissions();
      if (status.receive !== "granted") {
        const req = await PushNotifications.requestPermissions();
        if (req.receive !== "granted") return null;
      }
      await PushNotifications.register();
      return "native";
    }
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    return "web";
  } catch {
    return null;
  }
}
