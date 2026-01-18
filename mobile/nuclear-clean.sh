#!/bin/bash

set -e

echo "🧹 NUCLEAR CLEAN - Removing everything..."

cd "$(dirname "$0")"

# Kill any running Metro bundlers
pkill -f "expo start" || true
pkill -f "metro" || true

# Clean all caches
echo "Cleaning caches..."
rm -rf node_modules/.cache
rm -rf .expo
rm -rf .metro
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# Clean iOS completely
echo "Cleaning iOS..."
rm -rf ios/Pods
rm -rf ios/Podfile.lock
rm -rf ios/build
rm -rf ios/DerivedData
rm -rf ~/Library/Developer/Xcode/DerivedData/promisetrackermobile-*

# Clean Android completely  
echo "Cleaning Android..."
cd android
./gradlew clean 2>/dev/null || true
rm -rf app/build
rm -rf .gradle
rm -rf build
rm -rf .cxx
cd ..

# Clean watchman
echo "Cleaning watchman..."
watchman watch-del-all 2>/dev/null || true

echo "✅ Clean complete!"
echo ""
echo "Now run:"
echo "  1. npm install"
echo "  2. cd ios && pod install && cd .."
echo "  3. npx expo run:ios"
