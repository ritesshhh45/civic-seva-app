import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "in.wardseva.sanjaychaudhary",
  appName: "Sanjay Chaudhary",
  webDir: "dist",
  android: {
    allowMixedContent: false,
  },
  server: {
    url: "https://civic-seva-app.vercel.app",
    androidScheme: "https",
    cleartext: false,
    allowNavigation: ["civic-seva-app.vercel.app"],
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
