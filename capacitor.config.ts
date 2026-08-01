import type { CapacitorConfig } from "@capacitor/cli";

/**
 * The app is server-rendered, so the native shell loads the production
 * deployment instead of a static copy. `capacitor-www` only holds the offline
 * fallback page that Capacitor requires as a web assets directory.
 */
const config: CapacitorConfig = {
  appId: "in.wardseva.sanjaychaudhary",
  appName: "Sanjay Chaudhary",
  webDir: "capacitor-www",
  android: {
    allowMixedContent: false,
  },
  server: {
    url: "https://civic-seva-app.vercel.app",
    androidScheme: "https",
    cleartext: false,
    allowNavigation: [
      "civic-seva-app.vercel.app",
      "*.supabase.co",
      "wa.me",
      "api.whatsapp.com",
    ],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#FFF7EC",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
