# Human AI Therapist — Application Guide

This guide explains how to run, edit, and build both the **Windows Desktop Application** and the **Android Mobile Application** from your codebase.

---

## 1. Windows Desktop Application (.exe)

### Run in Development Mode
To test the desktop app instantly:
```bash
npm run desktop:start
```

### Build Standalone Executable (.exe)
To package the app into a standalone `.exe`:
```bash
npm run desktop:build
```
Your compiled application will be located in:
```
dist-desktop/Human AI Therapist-win32-x64/Human AI Therapist.exe
```
You can create a shortcut to this `.exe` or zip that folder and share it with anyone on Windows.

---

## 2. Android Mobile Application (.apk)

The Android project has been generated in the [`android/`](./android) folder using Capacitor.

### Step 1: Update Mobile Assets (Whenever you edit HTML/CSS/JS)
Whenever you modify `index.html`, styles, or scripts, sync them to Android with:
```bash
npm run mobile:sync
```

### Step 2: Open in Android Studio
To open the project in Android Studio:
```bash
npx cap open android
```
*(Or manually open the `android` folder in Android Studio).*

### Step 3: Build the `.apk`
Inside Android Studio:
1. Click **Build** from the top menu bar.
2. Select **Build Bundle(s) / APK(s)** > **Build APK(s)**.
3. Once completed, click the **locate** popup link.
4. Your `.apk` file will be in:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```
You can transfer this `.apk` to any Android phone to install and use the app!

---

## 3. Project Configuration Files

- [`electron-main.js`](./electron-main.js): Desktop application window configuration and security settings.
- [`capacitor.config.json`](./capacitor.config.json): Capacitor mobile configuration.
- [`build-mobile-assets.js`](./build-mobile-assets.js): Asset synchronizer to keep mobile builds lightweight.
- [`package.json`](./package.json): NPM scripts and dependencies for both platforms.
