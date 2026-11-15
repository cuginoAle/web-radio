#!/usr/bin/env bash
# The release APK for our own devices: `pnpm build:apk`. android/ is regenerated from app.json and
# the plugins every time, so the APK is what the repo says. It lands in dist/NoSpyFi-<version>.apk,
# replacing the previous build of that version, signed with the release key when NOSPYFI_KEYSTORE
# points to it, otherwise with the debug keystore (README).
set -euo pipefail

: "${JAVA_HOME:?must point to a JDK 17}"
: "${ANDROID_HOME:?must point to the Android SDK (a regenerated android/ has no local.properties)}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="$(node -p "require('$ROOT/app.json').expo.version")"
APK="dist/NoSpyFi-$VERSION.apk"

cd "$ROOT"
# Local settings such as NOSPYFI_KEYSTORE (git-ignored, README "Signing a release").
if [ -f .env.local ]; then set -a; . ./.env.local; set +a; fi
# android/ is git-ignored, so prebuild's "uncommitted changes" question protects nothing here.
EXPO_NO_GIT_STATUS=1 pnpm expo prebuild --platform android --no-install
(cd android && ./gradlew assembleRelease -PreactNativeArchitectures=armeabi-v7a,arm64-v8a)

mkdir -p dist
BUILT=android/app/build/outputs/apk/release/app-release.apk
if [ -n "${NOSPYFI_KEYSTORE:-}" ]; then
  # Re-signs the debug-signed output with the release key (README). Asks for the password unless
  # NOSPYFI_KEYSTORE_PASS is set; the env: form keeps it out of the process list.
  BUILD_TOOLS="$(printf '%s\n' "$ANDROID_HOME"/build-tools/* | sort -V | tail -1)"
  PASS=()
  [ -n "${NOSPYFI_KEYSTORE_PASS:-}" ] && PASS=(--ks-pass env:NOSPYFI_KEYSTORE_PASS)
  "$BUILD_TOOLS/apksigner" sign --ks "$NOSPYFI_KEYSTORE" ${PASS[@]+"${PASS[@]}"} --out "$APK" "$BUILT"
  echo "Built $APK, signed with the release key:"
  "$BUILD_TOOLS/apksigner" verify --print-certs "$APK" | grep 'SHA-256'
else
  cp "$BUILT" "$APK"
  echo "Built $APK (debug key: set NOSPYFI_KEYSTORE to sign for release)"
fi

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
