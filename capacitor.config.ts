import type { CapacitorConfig } from "@capacitor/cli";

/**
 * The app is a server-rendered site, so the native shell loads the deployed
 * build instead of a static copy. This keeps the APK/IPA always up to date with
 * the admin panel — content changes go live without re-submitting the app.
 */
const config: CapacitorConfig = {
  appId: "in.wardseva.sanjaychaudhary",
  appName: "Sanjay Chaudhary",
  webDir: ".output/public",
  server: {
    androidScheme: "https",
    url: "https://civic-seva-app.lovable.app",
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1200,
      backgroundColor: "#FDF8F0",
      androidScaleType: "CENTER_CROP",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
