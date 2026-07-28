# Building the native apps (Capacitor)

Run these on your own machine (Mac needed for iOS), in this order:

```bash
# 1. Install dependencies and build the web app
npm install
npm run build

# 2. Initialise Capacitor (only the first time; config is already committed)
npx cap init "Sanjay Chaudhary" in.wardseva.sanjaychaudhary --web-dir=dist/client

# 3. Add the native platforms (only the first time)
npx cap add android
npx cap add ios

# 4. Copy the latest web build into the native projects (after every web change)
npm run build && npx cap sync

# 5. Open the native projects for signing + store submission
npx cap open android   # Android Studio
npx cap open ios       # Xcode
```

## App name, bundle ID and icon

- App name and bundle/package ID come from `capacitor.config.ts`
  (`appName`, `appId`). Change them there, then re-run `npx cap sync`.
- Android also reads the name from `android/app/src/main/res/values/strings.xml`.
- iOS reads it from `ios/App/App/Info.plist` (`CFBundleDisplayName`).
- App icons and splash images: put a 1024x1024 PNG at `resources/icon.png`
  and `resources/splash.png`, then run:

```bash
npm install -D @capacitor/assets
npx capacitor-assets generate
npx cap sync
```

## Push notifications

The in-app "Updates" feed and the notification permission request are already
wired. To deliver real background pushes you must add your own provider keys:

- **Android**: download `google-services.json` from Firebase and drop it in
  `android/app/`.
- **iOS**: enable Push Notifications + Background Modes in Xcode and upload
  your APNs key to Firebase.

Then run `npx cap sync` again.

## Admin panel

Open `/admin` on the web build (or via Profile → Admin in the app).
Sign in with the admin phone number and the `ADMIN_PIN` secret.
