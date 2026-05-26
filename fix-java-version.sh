#!/bin/bash

# Fix Java Version Mismatches in Android build.gradle
# Usage: ./fix-java-version.sh <target-java-version>
# Example: ./fix-java-version.sh 17

TARGET_JAVA=${1:-17}
SOURCE_JAVA=${2:-21}

if [ ! -f "android/app/build.gradle" ]; then
    echo "❌ Error: android/app/build.gradle not found"
    echo "Run this script from your project root directory"
    exit 1
fi

echo "🔧 Fixing Java version mismatches..."
echo "   From: Java $SOURCE_JAVA"
echo "   To:   Java $TARGET_JAVA"
echo ""

# Function to safely replace patterns
replace_pattern() {
    local old=$1
    local new=$2
    local file=$3
    
    if grep -q "$old" "$file"; then
        sed -i "s/${old}/${new}/g" "$file"
        echo "   ✓ Replaced: $old → $new"
    fi
}

cd android

# JavaVersion enums
replace_pattern "JavaVersion.VERSION_$SOURCE_JAVA" "JavaVersion.VERSION_$TARGET_JAVA" "app/build.gradle"
replace_pattern "JavaVersion\.VERSION_11" "JavaVersion.VERSION_$TARGET_JAVA" "app/build.gradle"

# jvmTarget
replace_pattern "jvmTarget = \"$SOURCE_JAVA\"" "jvmTarget = \"$TARGET_JAVA\"" "app/build.gradle"
replace_pattern "jvmTarget = \"11\"" "jvmTarget = \"$TARGET_JAVA\"" "app/build.gradle"

# sourceCompatibility
replace_pattern "sourceCompatibility = $SOURCE_JAVA" "sourceCompatibility = $TARGET_JAVA" "app/build.gradle"
replace_pattern "sourceCompatibility = 11" "sourceCompatibility = $TARGET_JAVA" "app/build.gradle"

# targetCompatibility
replace_pattern "targetCompatibility = $SOURCE_JAVA" "targetCompatibility = $TARGET_JAVA" "app/build.gradle"
replace_pattern "targetCompatibility = 11" "targetCompatibility = $TARGET_JAVA" "app/build.gradle"

# Bare numeric versions (be careful with this one - use grep first to verify)
if grep -q "\"$SOURCE_JAVA\"" app/build.gradle; then
    echo "   ⚠️  Found bare \"$SOURCE_JAVA\" in build.gradle - replace? (y/n)"
    read -r confirm
    if [ "$confirm" = "y" ]; then
        sed -i "s/\"$SOURCE_JAVA\"/\"$TARGET_JAVA\"/g" app/build.gradle
        echo "   ✓ Replaced all \"$SOURCE_JAVA\" → \"$TARGET_JAVA\""
    fi
fi

echo ""
echo "📋 Verification - Java versions in build.gradle:"
grep -E "JavaVersion|jvmTarget|sourceCompatibility|targetCompatibility" app/build.gradle | head -10

echo ""
echo "✅ Done! Java versions updated."
echo ""
echo "Next steps:"
echo "  1. Review the changes: grep -n 'JavaVersion\|sourceCompatibility\|targetCompatibility' android/app/build.gradle"
echo "  2. If looks good, build: ./gradlew clean && ./gradlew assembleDebug --no-daemon"
echo "  3. Commit: git add android/app/build.gradle && git commit -m 'fix: update Java version to $TARGET_JAVA'"
