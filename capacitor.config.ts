import type { CapacitorConfig } from "@capacitor/cli";

/**
 * The app is a server-rendered site, so the native shell loads the deployed
 * build instead of a static copy. This keeps the APK/IPA always up to date with
 * the admin panel — content changes go live without re-submitting the app.
 */
const config: CapacitorConfig = {
  appId: "in.wardseva.sanjaychaudhary",
  appName: "Sanjay Chaudhary",
  webDir: "capacitor-www",
  server: {
    url: "https://civic-seva-app.vercel.app",
    androidScheme: "https",
    cleartext: false,
  },
};

export default config;
