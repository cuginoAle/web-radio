#!/usr/bin/env bash
# Installs dist/NoSpyFi-<version>.apk (`pnpm build:apk`) over the app on the device plugged in by USB:
# `pnpm install:apk`. Emulators are ignored, this is for the real phone or tablet.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="$(node -p "require('$ROOT/app.json').expo.version")"
APK="$ROOT/dist/NoSpyFi-$VERSION.apk"

if [ ! -e "$APK" ]; then
  echo "dist/NoSpyFi-$VERSION.apk does not exist: run pnpm build:apk first." >&2
  exit 1
fi

DEVICES=()
while IFS= read -r serial; do DEVICES+=("$serial"); done < <(adb devices | awk 'NR > 1 && $2 == "device" && $1 !~ /^emulator-/ { print $1 }')
if [ "${#DEVICES[@]}" -ne 1 ]; then
  echo "Expected one device plugged in (and authorised), found ${#DEVICES[@]}: ${DEVICES[*]:-none}." >&2
  exit 1
fi
DEVICE="${DEVICES[0]}"

if ! OUTPUT="$(adb -s "$DEVICE" install -r "$APK" 2>&1)"; then
  echo "$OUTPUT" >&2
  if [[ "$OUTPUT" == *INSTALL_FAILED_UPDATE_INCOMPATIBLE* ]]; then
    echo "The NoSpyFi on $DEVICE is signed with a different key (debug vs release). Uninstall it first with" >&2
    echo "  adb -s $DEVICE uninstall app.webradio.player" >&2
    echo "which deletes its favourites and listening time." >&2
  fi
  exit 1
fi
echo "$OUTPUT"
echo "Installed NoSpyFi $VERSION on $DEVICE."
