#!/bin/bash

# Script to fix react-native-worklets version mismatch
# This will clean all build artifacts and rebuild native code

set -e

echo "🧹 Cleaning build artifacts..."

# Clean Metro bundler cache
rm -rf node_modules/.cache
rm -rf .expo

# Clean iOS
echo "🍎 Cleaning iOS..."
rm -rf ios/Pods
rm -rf ios/Podfile.lock
rm -rf ios/build
rm -rf ios/DerivedData

# Clean Android
echo "🤖 Cleaning Android..."
cd android
./gradlew clean
rm -rf app/build
rm -rf .gradle
rm -rf build
cd ..

echo "📦 Reinstalling pods..."
cd ios
pod install
cd ..

echo "✅ Clean complete! Now rebuild your app:"
echo "   For iOS: npm run ios"
echo "   For Android: npm run android"
echo ""
echo "   Or use Expo: npx expo run:ios or npx expo run:android"
