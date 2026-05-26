# Native Android Build Guide

Complete step-by-step guide for building the Tasbih Counter Android APK.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Development Workflow](#development-workflow)
4. [Building Release APK](#building-release-apk)
5. [GitHub Actions (Automated Builds)](#github-actions-automated-builds)
6. [Troubleshooting](#troubleshooting)
7. [Project Structure](#project-structure)

---

## Prerequisites

Before building the Android app, ensure you have the following installed:

| Requirement | Version | Download Link |
|-------------|---------|---------------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org/) |
| Java JDK | 17 | [Adoptium](https://adoptium.net/) |
| Android Studio | Latest | [developer.android.com](https://developer.android.com/studio) |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

### Android Studio Setup

1. Install Android Studio
2. Open Android Studio → **SDK Manager** (Settings → Appearance & Behavior → System Settings → Android SDK)
3. Install:
   - **SDK Platforms**: Android 14 (API 34) or latest
   - **SDK Tools**: 
     - Android SDK Build-Tools
     - Android SDK Command-line Tools
     - Android Emulator (optional, for testing)

4. Set `ANDROID_HOME` environment variable:

**Windows (PowerShell):**
```powershell
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
```

**macOS/Linux (.bashrc or .zshrc):**
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

---

## Quick Start

Clone the repository and build in 5 commands:

```bash
# 1. Clone and install dependencies
git clone <your-repo-url>
cd tasbihcounter
npm install

# 2. Build web assets
npm run build

# 3. Add Android platform (first time only)
npx cap add android

# 4. Sync web assets to Android
npx cap sync android

# 5. Build Debug APK
cd android && ./gradlew assembleDebug
```

**APK Output Location:**
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Development Workflow

### Running on Physical Device

1. Enable **Developer Options** on your Android device
2. Enable **USB Debugging**
3. Connect device via USB
4. Run:

```bash
npx cap run android
```

### Running on Emulator

1. Open Android Studio → **Device Manager**
2. Create a new Virtual Device (Pixel 6, API 34 recommended)
3. Start the emulator
4. Run:

```bash
npx cap run android
```

### Live Reload (Hot Reload)

For development with live reload, the `capacitor.config.ts` includes a server configuration:

```typescript
server: {
  url: 'https://2d684afd-2394-4667-ab2b-42c63ccdd662.lovableproject.com?forceHideBadge=true',
  cleartext: true
}
```

> ⚠️ **Important:** Comment out or remove the `server` block before building a production APK!

### Common Development Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build web assets |
| `npx cap sync` | Sync web assets + plugins to native |
| `npx cap copy` | Copy web assets only (faster) |
| `npx cap run android` | Build and run on device/emulator |
| `npx cap open android` | Open project in Android Studio |

---

## Building Release APK

### Step 1: Generate Signing Keystore

```bash
keytool -genkey -v -keystore release.keystore -alias tasbih-key -keyalg RSA -keysize 2048 -validity 10000
```

Move the keystore to `android/app/release.keystore`

### Step 2: Configure Signing in build.gradle

Edit `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('release.keystore')
            storePassword 'your-store-password'
            keyAlias 'tasbih-key'
            keyPassword 'your-key-password'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 3: Build Release APK

```bash
# Remove dev server config from capacitor.config.ts first!
npm run build
npx cap sync android
cd android
./gradlew assembleRelease
```

**APK Output Location:**
```
android/app/build/outputs/apk/release/app-release.apk
```

### Step 4: Build App Bundle (for Play Store)

```bash
./gradlew bundleRelease
```

**AAB Output Location:**
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## GitHub Actions (Automated Builds)

The project includes a GitHub Actions workflow for automated builds.

### Workflow Location
`.github/workflows/android-build.yml`

### Triggering Builds

**Automatic:** Push to `main` branch or create a pull request

**Manual:** 
1. Go to GitHub → Actions → "Android Build"
2. Click "Run workflow"

### Downloading APKs

1. Go to GitHub → Actions
2. Click on the completed workflow run
3. Scroll to "Artifacts" section
4. Download `app-debug-apk` or `app-release-apk`

### Firebase App Distribution (Optional)

To enable automatic distribution to testers:

1. Set up Firebase project
2. Add repository secrets:
   - `FIREBASE_APP_ID`: Your Firebase App ID
   - `FIREBASE_TOKEN`: Firebase CI token (run `firebase login:ci`)
3. Uncomment the Firebase deployment job in the workflow

---

## Troubleshooting

### SDK Location Not Found

**Error:** `SDK location not found`

**Solution:** Create `android/local.properties`:
```properties
sdk.dir=/path/to/your/Android/Sdk
```

Common paths:
- **Windows:** `C:\\Users\\YourName\\AppData\\Local\\Android\\Sdk`
- **macOS:** `/Users/YourName/Library/Android/sdk`
- **Linux:** `/home/YourName/Android/Sdk`

---

### Java Encoding Errors

**Error:** `sun.jnu.encoding is undefined` or `platform encoding not initialized`

**Solution:** Add to `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8
```

---

### Gradle Daemon Issues

**Error:** `Could not connect to Gradle daemon`

**Solution:**
```bash
cd android
./gradlew --stop
./gradlew clean
./gradlew assembleDebug
```

---

### Permission Denied (Linux/macOS)

**Error:** `./gradlew: Permission denied`

**Solution:**
```bash
chmod +x android/gradlew
```

---

### Wrong Java Version

**Error:** `Unsupported class file major version` or `Invalid JDK`

**Solution:** Ensure Java 17 is installed and active:
```bash
java -version  # Should show version 17.x.x
```

Set `JAVA_HOME` if needed:
```bash
export JAVA_HOME=/path/to/java-17
```

---

### Build Cache Issues

**Error:** Unexplained build failures after updates

**Solution:** Clean everything:
```bash
cd android
./gradlew clean
rm -rf .gradle
rm -rf app/build
cd ..
npx cap sync android
cd android && ./gradlew assembleDebug
```

---

## Project Structure

```
tasbihcounter/
├── android/                    # Native Android project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/           # Native Java code
│   │   │   └── res/            # Android resources (icons, splash)
│   │   ├── build.gradle        # App-level Gradle config
│   │   └── release.keystore    # Signing key (keep secret!)
│   ├── build.gradle            # Project-level Gradle config
│   ├── gradle.properties       # Gradle settings
│   ├── gradlew                 # Gradle wrapper (Unix)
│   ├── gradlew.bat             # Gradle wrapper (Windows)
│   └── variables.gradle        # Version variables
├── src/                        # Web app source code
├── dist/                       # Built web assets (generated)
├── capacitor.config.ts         # Capacitor configuration
└── package.json                # Node.js dependencies
```

### Key Configuration Files

| File | Purpose |
|------|---------|
| `capacitor.config.ts` | Capacitor app settings (appId, webDir, server) |
| `android/variables.gradle` | SDK versions and dependencies |
| `android/app/build.gradle` | Android build configuration |
| `android/gradle.properties` | Gradle JVM and Android settings |

---

## Quick Reference

### Build Commands Cheatsheet

```bash
# Development
npm run dev                     # Start web dev server
npm run build && npx cap sync   # Build and sync to native
npx cap run android             # Run on device/emulator

# Production
npm run build                   # Build production web assets
npx cap sync android            # Sync to Android
cd android && ./gradlew assembleRelease  # Build release APK

# Debugging
npx cap open android            # Open in Android Studio
adb logcat                      # View device logs
```

### APK Locations

| Build Type | Path |
|------------|------|
| Debug | `android/app/build/outputs/apk/debug/app-debug.apk` |
| Release | `android/app/build/outputs/apk/release/app-release.apk` |
| Bundle | `android/app/build/outputs/bundle/release/app-release.aab` |

---

## Need Help?

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Docs](https://developer.android.com/docs)
- [Lovable Documentation](https://docs.lovable.dev)
