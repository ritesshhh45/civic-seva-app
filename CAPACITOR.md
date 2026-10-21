# Building the Android APK (and the iOS app)

The app is a Vite SPA. Capacitor packages `dist/` and is configured to open only
the production site `https://civic-seva-app.vercel.app`.

## Exact command sequence (run in order)

```bash
npm install
npm run build
npx cap sync android
npx cap open android
```

Shortcuts are also available: `npm run android` (build + sync),
`npm run cap:sync`, `npm run cap:open`.

## One-time setup on your machine

Install Node 20+, Java 21 (JDK) and Android Studio (with the Android SDK and
"Android SDK Command-line Tools" checked in SDK Manager).

## Build a debug APK (installable today)

```bash
npm install
npx cap sync android
cd android
./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

## Build a signed release AAB / APK for the Play Store

```bash
# 1. Create a keystore once and keep it safe
keytool -genkey -v -keystore ~/sanjay-release.jks -keyalg RSA -keysize 2048 \
  -validity 10000 -alias sanjay

# 2. Tell Gradle about it
cat >> android/gradle.properties <<'EOF'
SANJAY_STORE_FILE=/absolute/path/to/sanjay-release.jks
SANJAY_STORE_PASSWORD=yourStorePassword
SANJAY_KEY_ALIAS=sanjay
SANJAY_KEY_PASSWORD=yourKeyPassword
EOF
```

Add the signing config to `android/app/build.gradle` inside `android { ... }`:

```gradle
signingConfigs {
    release {
        storeFile file(SANJAY_STORE_FILE)
        storePassword SANJAY_STORE_PASSWORD
        keyAlias SANJAY_KEY_ALIAS
        keyPassword SANJAY_KEY_PASSWORD
    }
}
buildTypes {
    release { signingConfig signingConfigs.release }
}
```

Then:

```bash
npx cap sync android
cd android
./gradlew bundleRelease   # AAB: app/build/outputs/bundle/release/app-release.aab
./gradlew assembleRelease # APK: app/build/outputs/apk/release/app-release.apk
```

## iOS (needs a Mac + Xcode)

```bash
npm install
npx cap add ios       # first time only
npx cap sync ios
npx cap open ios      # set signing team, then Product > Archive
```

## App name, bundle ID, icon and splash

- Name / bundle ID: `capacitor.config.ts` (`appName`, `appId`), then `npx cap sync`.
- Android name also in `android/app/src/main/res/values/strings.xml`.
- iOS name in `ios/App/App/Info.plist` (`CFBundleDisplayName`).
- Icons and splash images:

```bash
npm install -D @capacitor/assets
# put 1024x1024 PNGs at resources/icon.png and resources/splash.png
npx capacitor-assets generate
npx cap sync
```

## Push notifications

- **Android**: put `google-services.json` from Firebase into `android/app/`.
- **iOS**: enable Push Notifications + Background Modes in Xcode and upload the
  APNs key to Firebase.
- Then `npx cap sync` again.

## Admin panel

Open `/admin` (also reachable from Profile → Admin when signed in).
Sign in with **email + password**. `ritesshhh19@gmail.com` is the primary admin:
the first time, use "First time? Create account", verify the emailed link and
sign in. Any other email that signs up lands in the Admins tab as a pending
request the primary admin can Allow, Deny or Revoke.
