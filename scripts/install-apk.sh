#!/usr/bin/env bash
# Installs dist/Radio-<version>.apk (`pnpm build:apk`) over the app on the device plugged in by USB:
# `pnpm install:apk`. Emulators are ignored, this is for the real phone or tablet.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="$(node -p "require('$ROOT/app.json').expo.version")"
APK="$ROOT/dist/Radio-$VERSION.apk"

if [ ! -e "$APK" ]; then
  echo "dist/Radio-$VERSION.apk does not exist: run pnpm build:apk first." >&2
  exit 1
fi

DEVICES=()
while IFS= read -r serial; do DEVICES+=("$serial"); done < <(adb devices | awk 'NR > 1 && $2 == "device" && $1 !~ /^emulator-/ { print $1 }')
if [ "${#DEVICES[@]}" -ne 1 ]; then
  echo "Expected one device plugged in (and authorised), found ${#DEVICES[@]}: ${DEVICES[*]:-none}." >&2
  exit 1
fi
DEVICE="${DEVICES[0]}"

adb -s "$DEVICE" install -r "$APK"
echo "Installed Radio $VERSION on $DEVICE."
