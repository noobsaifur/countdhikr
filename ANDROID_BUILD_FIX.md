# Android Build Fix - Complete Deployment Checklist

## 🎯 What's Being Fixed

Your countdhikr Android build is failing due to **4 interconnected issues**:

1. **Dependency Resolution** → `Could not find androidx.core:core-splashscreen:1.0.2`
2. **Java Version Mismatch** → `error: invalid source release: 21`
3. **Gradle Deprecation** → Incompatible with Gradle 9.0
4. **Stale Build State** → Previous failed builds leave broken artifacts

---

## ✅ Pre-Deployment Checklist

Before you push anything, verify locally:

```bash
# 1. Check current Node/npm versions
node --version     # Should be v18+
npm --version      # Should be v9+

# 2. Check if Capacitor is installed
ls -la node_modules/@capacitor/

# 3. Check Gradle wrapper version
cat android/gradle/wrapper/gradle-wrapper.properties | grep distributionUrl
# Should show gradle-8.x.x or higher

# 4. Verify web build works
npm run build
# Should complete without errors

# 5. Check existing build.gradle for issues
grep -E "VERSION_21|jvmTarget.*21|sourceCompatibility.*21" android/app/build.gradle
# Should return EMPTY (no Java 21 references)
```

---

## 🚀 Deployment Steps (5 minutes)

### Step 1: Update Workflow File
```bash
# Copy the fixed workflow
cp android-build-workflow.yml .github/workflows/android-build.yml

# Verify it was copied correctly
ls -la .github/workflows/android-build.yml
```

### Step 2: Optional - Update Capacitor Dependencies Locally
```bash
# Update to latest Capacitor versions
npm update @capacitor/android @capacitor/core
npm install

# Sync with Android
npx cap sync android

# Check what changed
git diff package.json
git diff package-lock.json
```

### Step 3: Commit & Push
```bash
# Stage all changes
git add .github/workflows/android-build.yml
git add package.json package-lock.json 2>/dev/null || true

# Commit with clear message
git commit -m "fix: comprehensive Android build improvements

- Update Gradle wrapper to 8.10.2 (avoid Gradle 9.0 deprecation)
- Fix all Java 21 references in generated build.gradle
- Add UTF-8 encoding to compile tasks
- Update Capacitor dependencies to latest stable
- Clean Android platform and Gradle cache on each build
- Configure proper JVM memory and encoding settings"

# Push to main branch
git push origin main
```

### Step 4: Monitor GitHub Actions
```
✅ Go to: https://github.com/noobsaifur/countdhikr/actions
✅ Click on the latest workflow run
✅ Watch the build complete
✅ Check for green ✓ checkmarks
```

---

## 🔍 Workflow Execution Order

The updated workflow now does this **in the correct sequence**:

| # | Step | Duration | Why |
|---|------|----------|-----|
| 1 | Checkout code | 5s | Get latest source |
| 2 | Setup Node 24 | 10s | Install Node/npm |
| 3 | Setup Java 17 | 10s | Install Java compiler |
| 4 | Setup Android SDK | 30s | Download build tools |
| 5 | npm install | 15s | Install dependencies |
| 6 | npm update Capacitor | 10s | Update to latest version |
| 7 | npm run build | 10s | Build React web app |
| 8 | **Remove stale android/** | 5s | ← **CRITICAL** Clean state |
| 9 | npx cap add android | 10s | ← Generate fresh platform |
| 10 | npx cap sync android | 5s | ← Copy web assets |
| 11 | Update Gradle wrapper | 5s | ← **Fix Gradle 9.0 issue** |
| 12 | Configure gradle.properties | 5s | ← Set JVM memory & encoding |
| 13 | **Update Java versions** | 5s | ← **Fix Java 21 mismatch** |
| 14 | Make gradlew executable | 2s | Ensure script works |
| 15 | ./gradlew clean | 20s | ← Clear old artifacts |
| 16 | **./gradlew assembleDebug** | 60s | ← **Build APK** |
| 17 | Upload APK artifact | 5s | Save output |

**Total expected time:** ~3 minutes

---

## ✨ Success Indicators

Look for these in the GitHub Actions output:

```
✓ Checkout code
✓ Setup Node
✓ Setup Java
✓ Setup Android SDK
✓ Install npm dependencies
✓ Update Capacitor dependencies
✓ Build web assets (npm run build)
✓ Removed stale Android platform directory
✓ Added fresh Android platform
✓ Sync Capacitor
✓ Updated Gradle wrapper to 8.10.2
✓ Updated all Java version references to 17
✓ Cleaned Gradle cache
✓ built in X.XXs                    ← KEY: Build succeeded
✓ Upload APK artifact
```

**BUILD SUCCESSFUL** ✅

---

## ❌ If Build Still Fails

### Check 1: Verify Web Build Passed
```bash
npm run build
# Should say "✓ built in X.XXs"
```

### Check 2: Verify Java Versions in Generated build.gradle
```bash
cd android
grep -E "VERSION_21|VERSION_11|jvmTarget.*21|sourceCompatibility.*21|targetCompatibility.*21" app/build.gradle
# Should return NOTHING
```

### Check 3: Check Gradle Wrapper Version
```bash
cat gradle/wrapper/gradle-wrapper.properties | grep distributionUrl
# Should show gradle-8.10.2-bin.zip
```

### Check 4: Run Fix Script Locally
```bash
chmod +x fix-java-version.sh
./fix-java-version.sh 17
# Then try building locally
cd android && ./gradlew clean && ./gradlew assembleDebug
```

### Check 5: Review GitHub Actions Logs
- Click the failed workflow
- Expand "Update build.gradle for Java 17" step
- Look for the verification grep output
- Check for "ERROR" or "invalid source release"

---

## 📋 What Changed

| File | Changes | Impact |
|------|---------|--------|
| `.github/workflows/android-build.yml` | **+15 new steps**, updated sed commands, Gradle wrapper update | ← MAIN FIX |
| `package.json` | Capacitor versions updated (if you ran npm update) | Ensures compatibility |
| `android/gradle/wrapper/gradle-wrapper.properties` | Version updated to 8.10.2 | Avoids Gradle 9.0 issues |
| `android/gradle.properties` | UTF-8 encoding + warning-mode added | Prevents deprecation warnings |
| `android/app/build.gradle` | Java 21 → 17, UTF-8 config added | Matches Java 17 runtime |

---

## 🆘 Need Help?

| Issue | Solution |
|-------|----------|
| "Where do I copy the workflow?" | Copy `android-build-workflow.yml` to `.github/workflows/android-build.yml` in your repo |
| "Do I need to run npm update?" | Optional but recommended - it updates Capacitor to latest |
| "What if the build still fails?" | Check the 5 diagnostic steps under "If Build Still Fails" |
| "How do I see the GitHub Actions logs?" | Go to your repo → Actions tab → Click the failed build → Expand steps |
| "Can I roll back?" | Yes: `git revert <commit-hash>` and push again |

---

## 📚 Documentation Files

You have 4 files to reference:

1. **`android-build-workflow.yml`** ← The actual workflow file to copy
2. **`ANDROID_BUILD_FIX.md`** ← Detailed technical explanation
3. **`QUICK_REFERENCE.md`** ← One-page cheat sheet
4. **`fix-java-version.sh`** ← Local debugging script

---

## 🎉 After Successful Build

Once the build passes:

1. ✅ APK will be generated: `android/app/build/outputs/apk/debug/app-debug.apk`
2. ✅ Artifact will be uploaded to GitHub Actions
3. ✅ You can download and test the APK
4. ✅ Further CI/CD steps can reference the artifact

---

## 🔐 Security Notes

- No secrets or credentials are stored in the workflow
- All build tools are from official repositories
- Gradle wrapper is locked to a specific version (8.10.2)
- No custom scripts run without explicit `chmod +x`
