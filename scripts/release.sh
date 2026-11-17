#!/usr/bin/env bash
# Cuts a release: `pnpm release [patch|minor|major|X.Y.Z]`, asking for the type when omitted
# (README, "Releasing an update").
# Bumps the version in app.json and package.json (versionCode +1), builds the signed APK (offering
# a USB install), opens your editor for the release notes, then asks before committing, tagging
# (notes as the tag message), pushing and publishing the GitHub Release (scripts/release-publish.sh).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# Local settings such as NOSPYFI_KEYSTORE (git-ignored, README "Signing a release").
if [ -f .env.local ]; then set -a; . ./.env.local; set +a; fi

fail() {
  echo "$*" >&2
  exit 1
}

BUMP="${1:-}"
[[ -z "$BUMP" || "$BUMP" =~ ^(patch|minor|major|[0-9]+\.[0-9]+\.[0-9]+)$ ]] || fail "Usage: pnpm release [patch|minor|major|X.Y.Z]"
[ -n "${NOSPYFI_KEYSTORE:-}" ] || fail "Set NOSPYFI_KEYSTORE (in .env.local) to the release keystore: releases are never debug-signed."
gh auth status >/dev/null 2>&1 || fail "gh is missing or not logged in: see docs/build-and-release.md, section 7 (The GitHub token)."
[ -z "$(git status --porcelain)" ] || fail "The working tree is not clean: commit or stash first."
[ "$(git branch --show-current)" = main ] || fail "Releases are cut from main."
git fetch --quiet origin main
[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] || fail "main is not level with origin/main: pull or push first."

CURRENT="$(node -p "require('./app.json').expo.version")"
next_version() {
  node -e '
    const [current, bump] = process.argv.slice(1);
    if (/^\d+\.\d+\.\d+$/.test(bump)) {
      console.log(bump);
    } else {
      const parts = current.split(".").map(Number);
      const at = { major: 0, minor: 1, patch: 2 }[bump];
      parts[at]++;
      parts.fill(0, at + 1);
      console.log(parts.join("."));
    }
  ' "$CURRENT" "$1"
}

# Asked before the slow checks, so the rest runs unattended until the install offer.
while [ -z "$BUMP" ]; do
  read -r -p "Current version $CURRENT. Release type: patch ($(next_version patch)), minor ($(next_version minor)), major ($(next_version major)) [patch]: " answer
  case "${answer:-patch}" in
    patch | minor | major) BUMP="${answer:-patch}" ;;
    *) echo "patch, minor or major." ;;
  esac
done
VERSION="$(next_version "$BUMP")"
TAG="v$VERSION"
git rev-parse -q --verify "refs/tags/$TAG" >/dev/null && fail "Tag $TAG already exists locally."
git ls-remote --exit-code --tags origin "refs/tags/$TAG" >/dev/null && fail "Tag $TAG already exists on origin."

pnpm test
pnpm typecheck
pnpm lint

# From here until the commit, any exit (failed build, "no", Ctrl-C) puts the version back.
NOTES="$(mktemp)"
restore() {
  rm -f "$NOTES"
  git checkout -- app.json package.json
  echo "Release cancelled: app.json and package.json restored."
}
trap restore EXIT
trap 'exit 130' INT TERM

node -e '
  const fs = require("fs");
  const version = process.argv[1];
  // Text replacement, not JSON.stringify, so the files keep their formatting.
  const bump = (file, edit) => fs.writeFileSync(file, edit(fs.readFileSync(file, "utf8")));
  const setVersion = (text) => text.replace(/"version": "[^"]*"/, `"version": "${version}"`);
  bump("package.json", setVersion);
  bump("app.json", (text) => setVersion(text).replace(/"versionCode": (\d+)/, (_, code) => `"versionCode": ${Number(code) + 1}`));
' "$VERSION"
echo "Version $CURRENT -> $VERSION (versionCode $(node -p "require('./app.json').expo.android.versionCode"))"

scripts/build-apk.sh

# Release notes, written like a commit message: the commits are a draft, '#' lines are dropped.
PREVIOUS="$(git describe --tags --abbrev=0 2>/dev/null || true)"
{
  echo
  echo "# Release notes for NoSpyFi $VERSION: a few lines for users, in Markdown (Obtainium shows them)."
  echo "# Lines starting with '#' are dropped, so no Markdown headings. Empty notes cancel the release."
  echo "#"
  echo "# Commits since ${PREVIOUS:-the beginning}:"
  git --no-pager log --format='#   %s' ${PREVIOUS:+"$PREVIOUS..HEAD"}
} >"$NOTES"
sh -c "$(git var GIT_EDITOR) \"\$@\"" editor "$NOTES"
NOTES_TEXT="$(git stripspace --strip-comments <"$NOTES")"
[ -n "$NOTES_TEXT" ] || fail "Empty release notes."

read -r -p "Publish $TAG (commit, tag, push and GitHub Release)? [y/N] " answer
case "$answer" in
  y | Y | yes) ;;
  *) exit 1 ;;
esac

git commit --quiet -m "chore(release): $TAG" app.json package.json
# The tag carries the notes; release-publish.sh reads the GitHub Release's title and body from it.
printf 'NoSpyFi %s\n\n%s\n' "$VERSION" "$NOTES_TEXT" | git tag -a "$TAG" -F -
rm -f "$NOTES"
trap - EXIT
git push --atomic origin main "$TAG" || fail "Push failed: the commit and tag are local. Retry with: git push --atomic origin main $TAG && pnpm release:publish $TAG"

scripts/release-publish.sh "$TAG" || fail "Publishing the GitHub Release failed; the tag is pushed. Retry with: pnpm release:publish $TAG"
