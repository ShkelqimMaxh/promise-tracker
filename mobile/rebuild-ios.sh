#!/bin/bash

# Complete iOS rebuild script to fix worklets version mismatch

set -e

echo "🧹 Cleaning everything..."

cd "$(dirname "$0")"

# Clean all caches
rm -rf ios/build
rm -rf ios/DerivedData
rm -rf .expo
rm -rf node_modules/.cache
rm -rf ~/Library/Developer/Xcode/DerivedData/promisetrackermobile-* 2>/dev/null || true

# Clean Metro bundler
watchman watch-del-all 2>/dev/null || true

echo "📦 Reinstalling pods..."
cd ios
pod install
cd ..

echo "🔨 Rebuilding iOS app..."
echo ""
echo "This will take a few minutes. The app will launch automatically when done."
echo ""

npx expo run:ios --no-build-cache

echo ""
echo "✅ Rebuild complete!"
