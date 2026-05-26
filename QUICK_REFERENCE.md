# Android Build Fix - Quick Reference Card

## TL;DR - What's Wrong & How to Fix It

**Problem:** `error: invalid source release: 21`
- Capacitor generates `build.gradle` with Java 21
- Workflow runs on Java 17
- Mismatch causes build failure

**Solution:** Replace ALL Java 21 references with Java 17

## 3-Step Fix

### Step 1: Update Your Workflow
Copy the updated `.github/workflows/android-build.yml` to your repo.

**Key changes in the "Update build.gradle for Java 17" step:**
```bash
sed -i 's/JavaVersion.VERSION_21/JavaVersion.VERSION_17/g' app/build.gradle
sed -i 's/sourceCompatibility = 21/sourceCompatibility = 17/g' app/build.gradle
sed -i 's/targetCompatibility = 21/targetCompatibility = 17/g' app/build.gradle
sed -i 's/"21"/"17"/g' app/build.gradle
```

### Step 2: Commit & Push
```bash
git add .github/workflows/android-build.yml
git commit -m "fix: handle all Java 21 version patterns in build.gradle"
git push origin main
```

### Step 3: Wait for Build
GitHub Actions will now:
1. ✅ Remove stale Android platform
2. ✅ Add fresh Android platform
3. ✅ Replace ALL Java 21 → Java 17 references
4. ✅ Clean Gradle cache
5. ✅ Build APK successfully

---

## What the Workflow Does (In Order)

| Step | Purpose | Why |
|------|---------|-----|
| Remove `android/` | Clean stale state | Previous failed builds leave broken artifacts |
| `npm install` | Get dependencies | Need Capacitor, React, build tools |
| `npm run build` | Build web assets | React app → static files |
| `npx cap add android` | Generate Android project | Fresh Capacitor Android setup |
| `npx cap sync android` | Copy web assets | Web files → Android assets |
| Configure gradle.properties | Set JVM memory & Java home | Gradle needs proper config |
| **Replace Java versions** | **Change 21 → 17** | **THIS IS THE CRITICAL FIX** |
| `./gradlew clean` | Remove Gradle cache | Clear old/corrupted builds |
| `./gradlew assembleDebug` | Build APK | Compile Android app |

---

## Java Version Patterns (All Caught by Workflow)

```
❌ BEFORE                                  ✅ AFTER
JavaVersion.VERSION_21                    JavaVersion.VERSION_17
JavaVersion.VERSION_11                    JavaVersion.VERSION_17
jvmTarget = "21"                          jvmTarget = "17"
jvmTarget = "11"                          jvmTarget = "17"
sourceCompatibility = 21                  sourceCompatibility = 17
sourceCompatibility = 11                  sourceCompatibility = 17
targetCompatibility = 21                  targetCompatibility = 17
targetCompatibility = 11                  targetCompatibility = 17
"21"                                      "17"
'21'                                      '17'
```

---

## If Build Still Fails

### Check 1: Verify Web Build Passed
```bash
# Should see "✓ built in X.XXs"
npm run build
```

### Check 2: Verify Java Version in build.gradle
```bash
grep -E "JavaVersion|sourceCompatibility|targetCompatibility|jvmTarget" android/app/build.gradle
# Should show ONLY 17, no 21 or 11
```

### Check 3: Manual Fix Script (Optional)
```bash
# Run this to auto-fix all Java versions
chmod +x fix-java-version.sh
./fix-java-version.sh 17
```

### Check 4: Clean Local Build
```bash
cd android
./gradlew clean
./gradlew assembleDebug --no-daemon --stacktrace
```

### Check 5: GitHub Actions Logs
- Go to your repository
- Click "Actions"
- Click the failed build
- Expand "Update build.gradle for Java 17" step
- Look for the verification grep output
- Should show only Java 17 references

---

## Files Provided

| File | Purpose |
|------|---------|
| `android-build-workflow.yml` | Updated GitHub Actions workflow - **COPY TO** `.github/workflows/android-build.yml` |
| `ANDROID_BUILD_FIX.md` | Detailed explanation of all issues and solutions |
| `fix-java-version.sh` | Standalone script to fix Java versions locally |

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `error: invalid source release: 21` | Java 21 in build.gradle, Java 17 in workflow | Use updated workflow with Java 21 replacements |
| `Could not find androidx.core:core-splashscreen:1.0.2` | Gradle cache corruption | Workflow includes `./gradlew clean` before building |
| `android platform already exists` | Stale Android directory | Workflow removes `android/` before `npx cap add android` |
| `npm ERR! Could not resolve dependency` | Missing node_modules | Workflow runs `npm install --legacy-peer-deps` |

---

## Success Indicators

You'll know it worked when:

✅ GitHub Actions shows "✓ built in X.XXs" for npm build
✅ Gradle finishes without "invalid source release" error
✅ APK artifact is created and uploaded
✅ Build completes in ~2 minutes (first time may be slower)
