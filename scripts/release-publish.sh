#!/usr/bin/env bash
# Publishes the GitHub Release for a pushed tag: `pnpm release:publish vX.Y.Z`. `pnpm release` runs it
# after the push; rerun it on its own if that step failed (docs/build-and-release.md, section 7).
# Safe to rerun: it reuses a draft, replaces a partial upload and does nothing if already published.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# The release key's certificate (docs/build-and-release.md, section 4). Anything else is never published.
RELEASE_CERT_SHA256=20ca537f0c8dc8974627e68763573954a08f91edaf729fe8699c52e6549a2081

fail() {
  echo "$*" >&2
  exit 1
}

TAG="${1:-}"
[[ "$TAG" =~ ^v([0-9]+\.[0-9]+\.[0-9]+)$ ]] || fail "Usage: pnpm release:publish vX.Y.Z"
VERSION="${BASH_REMATCH[1]}"
APK="dist/NoSpyFi-$VERSION.apk"
REBUILD="Rebuild it from the tag with the release key: git checkout $TAG && pnpm build:apk && git checkout main"

git rev-parse -q --verify "refs/tags/$TAG" >/dev/null || fail "No tag $TAG here: git fetch --tags origin"
[ -f "$APK" ] || fail "$APK not found. $REBUILD"

# Guards against a debug-signed `pnpm build:apk` or another version having overwritten the file.
: "${ANDROID_HOME:?must point to the Android SDK}"
BUILD_TOOLS="$(printf '%s\n' "$ANDROID_HOME"/build-tools/* | sort -V | tail -1)"
SIGNERS="$("$BUILD_TOOLS/apksigner" verify --print-certs "$APK" | grep 'certificate SHA-256 digest' | awk '{print $NF}' | sort -u)"
[ "$SIGNERS" = "$RELEASE_CERT_SHA256" ] || fail "$APK is not signed with the release key. $REBUILD"
APK_VERSION="$("$BUILD_TOOLS/aapt2" dump badging "$APK" | sed -n "s/.*versionName='\([^']*\)'.*/\1/p")"
[ "$APK_VERSION" = "$VERSION" ] || fail "$APK has versionName $APK_VERSION, not $VERSION. $REBUILD"

DRAFT="$(gh release view "$TAG" --json isDraft --jq .isDraft 2>/dev/null || echo none)"
if [ "$DRAFT" = false ]; then
  echo "$TAG is already published: $(gh release view "$TAG" --json url --jq .url)"
  exit 0
fi
if [ "$DRAFT" = none ]; then
  # Title and notes come from the annotated tag that `pnpm release` wrote.
  git tag -l --format='%(contents:body)' "$TAG" |
    gh release create "$TAG" --verify-tag --draft --title "$(git tag -l --format='%(contents:subject)' "$TAG")" --notes-file -
fi
gh release upload "$TAG" "$APK" --clobber
gh release edit "$TAG" --draft=false --latest >/dev/null
echo "Published $TAG: $(gh release view "$TAG" --json url --jq .url)"
