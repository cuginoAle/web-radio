#!/usr/bin/env bash
# The release APK for our own devices: `pnpm build:apk`. android/ is regenerated from app.json and
# the plugins every time, so the APK is what the repo says. It lands in dist/Radio-<version>.apk,
# replacing the previous build of that version, and is signed with the debug keystore (README).
set -euo pipefail

: "${JAVA_HOME:?must point to a JDK 17}"
: "${ANDROID_HOME:?must point to the Android SDK (a regenerated android/ has no local.properties)}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="$(node -p "require('$ROOT/app.json').expo.version")"
APK="dist/Radio-$VERSION.apk"

cd "$ROOT"
# android/ is git-ignored, so prebuild's "uncommitted changes" question protects nothing here.
EXPO_NO_GIT_STATUS=1 pnpm expo prebuild --platform android --no-install
(cd android && ./gradlew assembleRelease -PreactNativeArchitectures=armeabi-v7a,arm64-v8a)

mkdir -p dist
cp android/app/build/outputs/apk/release/app-release.apk "$APK"
echo "Built $APK"

# Installed only when asked: no terminal, no question, no install. A refused or failed install
# (no device plugged in) leaves the build a success.
LATER="Install it with: pnpm install:apk"
if [ ! -t 0 ]; then
  echo "$LATER"
  exit 0
fi
while :; do
  read -r -p "Install it on the device now? [Y/n] " answer
  case "${answer:-y}" in
    y | Y | yes) "$ROOT/scripts/install-apk.sh" || echo "$LATER"; break ;;
    n | N | no) echo "$LATER"; break ;;
    *) echo "y or n." ;;
  esac
done
