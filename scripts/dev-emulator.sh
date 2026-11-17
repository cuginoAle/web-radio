#!/usr/bin/env bash
# Debug build on the Android emulator: `pnpm dev:emulator [avd-name]`. Boots the emulator if it is not
# running, builds and installs the debug app on it (never on a phone plugged in) and leaves Metro
# attached for Fast Refresh. Ctrl-C stops Metro, the emulator keeps running.
set -euo pipefail

: "${ANDROID_HOME:?must point to the Android SDK}"

AVD="${1:-Medium_Phone_API_36.0}"
ADB="$ANDROID_HOME/platform-tools/adb"
APP_ID="app.webradio.player"
LOG="${TMPDIR:-/tmp}/dev-emulator.log"

# Builds share android/ with scripts/build-apk.sh.
if pgrep -f 'build-apk.sh|gradlew' > /dev/null; then
  echo "A build (build-apk.sh or Gradle) is already running: wait for it to finish." >&2
  exit 1
fi

serial() { "$ADB" devices | awk '$1 ~ /^emulator-/ && $2 == "device" { print $1; exit }'; }

SERIAL="$(serial)"
if [ -z "$SERIAL" ]; then
  # After `adb emu kill` a second instance of the same AVD refuses to start until qemu is gone.
  while pgrep -f 'qemu-system' > /dev/null; do sleep 1; done
  # No -no-snapshot-save: the installed app must survive closing the emulator.
  nohup "$ANDROID_HOME/emulator/emulator" -avd "$AVD" -dns-server 8.8.8.8,1.1.1.1 > "$LOG" 2>&1 &
  echo "Starting $AVD (log: $LOG)..."
  for _ in $(seq 180); do
    SERIAL="$(serial)"
    [ -n "$SERIAL" ] && [ "$("$ADB" -s "$SERIAL" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = 1 ] && break
    SERIAL=""
    sleep 1
  done
  if [ -z "$SERIAL" ]; then
    echo "$AVD did not finish booting in 180 s, see $LOG." >&2
    exit 1
  fi
fi
echo "Emulator ready: $SERIAL"

cd "$(dirname "$0")/.."
# EXPO_NO_GIT_STATUS: android/ is git-ignored, same as in build-apk.sh.
if ! EXPO_NO_GIT_STATUS=1 pnpm expo run:android --device "$AVD"; then
  echo "If the install failed with INSUFFICIENT_STORAGE (/data is nearly full), free space with" >&2
  echo "  $ADB -s $SERIAL uninstall $APP_ID" >&2
  echo "which deletes favourites and listening time; the first run then needs \"Scarica catalogo\" tapped." >&2
  exit 1
fi
