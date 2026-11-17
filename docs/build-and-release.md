# Build, distribution and release

This document covers everything from turning the source into an APK to getting a new version onto users' phones. NoSpyFi has no server and is not in any app store, so there's no deploy step in the usual sense: **distribution is a GitHub Release with the signed APK attached**. Users install it by hand or through [Obtainium](https://github.com/ImranR98/Obtainium).

Each stage, from the command you run to what reaches users:

| Stage              | Command                       | Result                                                                                                                            |
| ------------------ | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Development build  | `pnpm android`                | Debug app with live reload, on a device or emulator                                                                               |
| Release APK        | `pnpm build:apk`              | `dist/NoSpyFi-<version>.apk`, signed with the release key if configured                                                           |
| Install on a phone | `pnpm install:apk`            | That APK installed over USB                                                                                                       |
| Release            | `pnpm release`                | Version bumped, APK built and tested, commit and tag pushed, GitHub Release published with the APK, which users and Obtainium see |
| Publish again      | `pnpm release:publish vX.Y.Z` | Only the GitHub Release step, if it failed during `pnpm release`                                                                  |

## 1. Prerequisites

- **Node 22.13 or newer** (the tests use `node:sqlite`) and **pnpm 11**. Use pnpm only: `pnpm-lock.yaml` is committed.
- **JDK 17**, with `JAVA_HOME` set.
- **Android SDK**, with `ANDROID_HOME` set. It needs at least one `build-tools` version, which provides `apksigner` and `zipalign`; the scripts pick the newest one installed.
- **`adb`** on the `PATH`, for installing on a device.
- **Git with push access** to `origin`, for releases. If your git config signs commits or tags with GPG, run releases in a real terminal so the passphrase prompt can appear.
- **`gh`** (`brew install gh`), logged in with the release token, for releases (see [section 7](#the-github-token)).

**Expo Go is not enough.** Background audio and the patched expo-audio module need a native build.

## 2. How the native project is produced

`android/` is **generated** and git-ignored (Expo's Continuous Native Generation). Never edit it by hand: every release build regenerates it from scratch. Native behaviour is configured in `app.json` and its config plugins:

| Setting in `app.json`                            | Effect                                                                                                            |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `android.package` = `app.webradio.player`        | The app's identity. **Never change it**: a new package is a different app, and users would lose their favourites. |
| `version` / `android.versionCode`                | See [section 5](#5-versioning).                                                                                   |
| `android.allowBackup: false`                     | App data stays off Google's cloud backup ([ADR 0004](adr/0004-network-limited-to-directory-and-stations.md)).     |
| `android.blockedPermissions`                     | Removes storage, overlay and vibrate permissions that libraries would otherwise add.                              |
| `expo-build-properties` → `usesCleartextTraffic` | Allows `http://` streams ([ADR 0001](adr/0001-global-cleartext-http.md)).                                         |
| `expo-audio` → `enableBackgroundPlayback`        | Foreground media service for playback with the screen off.                                                        |
| `expo-navigation-bar` → `hidden`                 | Android navigation bar hidden from launch (car head units).                                                       |

### The expo-audio patch

Now playing comes from a patch to expo-audio that reads ICY metadata ([ADR 0003](adr/0003-patch-expo-audio-icy-metadata.md)):

- `patches/expo-audio.patch` is applied by pnpm (`patchedDependencies` in `pnpm-workspace.yaml`).
- `package.json` → `expo.autolinking.android.buildFromSource: ["expo-audio"]` makes Gradle compile expo-audio from source. **Without it, Gradle uses the prebuilt library and silently ignores the patch**: the app builds and plays, but the song title never appears.

## 3. Development builds

```sh
pnpm install
pnpm android     # generates android/, builds a debug app and launches it
pnpm start       # Metro only, for a development build that's already installed
```

To debug on the emulator, run `pnpm dev:emulator [avd-name]` ([`scripts/dev-emulator.sh`](../scripts/dev-emulator.sh), default AVD `Medium_Phone_API_36.0`). It boots the emulator if none is running, builds and installs the debug app on it only (a plugged-in phone is ignored) and leaves Metro attached for Fast Refresh; Ctrl-C stops Metro, the emulator keeps running. It refuses to start while `build-apk.sh` or Gradle is running, since they share `android/`. It never uninstalls the app: on `INSTALL_FAILED_INSUFFICIENT_STORAGE` it prints the command and leaves the choice to you (see [Troubleshooting](#9-troubleshooting)).

Before declaring work done, run `pnpm test`, `pnpm typecheck` and `pnpm lint`. The release script runs them too.

## 4. Release APK and signing

### Building

```sh
pnpm build:apk
```

[`scripts/build-apk.sh`](../scripts/build-apk.sh) does the following:

1. Checks `JAVA_HOME` and `ANDROID_HOME`.
2. Loads `.env.local` from the repo root, if present (see below).
3. Regenerates `android/` (`expo prebuild --platform android`).
4. Builds the release variant for `armeabi-v7a` and `arm64-v8a` (`./gradlew assembleRelease`).
5. Signs the result:
   - **with `NOSPYFI_KEYSTORE` set:** re-signs the APK with the release key using `apksigner`, writes `dist/NoSpyFi-<version>.apk` and prints the certificate's SHA-256 fingerprint;
   - **without it:** copies the debug-signed APK to the same path. That's fine for your own devices, never for distribution.
6. When run in a terminal, offers to install it on the USB-connected phone.

`apksigner` also writes `dist/NoSpyFi-<version>.apk.idsig`, a signature used only for incremental installs. Don't publish it.

A build takes about 2–3 minutes. Several sessions or terminals share the same `android/` folder, so **don't start two builds at once**.

### The release key

Create it once, **outside the repository**:

```sh
keytool -genkeypair -v -storetype PKCS12 -keyalg RSA -keysize 4096 -validity 10000 \
  -alias nospyfi -keystore /path/outside/the/repo/nospyfi-release.keystore
chmod 600 /path/outside/the/repo/nospyfi-release.keystore
```

Then point the scripts at it in **`.env.local`** at the repo root. The file is git-ignored by `.env*.local`; plain `.env` is **not** ignored, so don't use it.

```sh
NOSPYFI_KEYSTORE=../WebRadioApkKey/nospyfi-release.keystore   # relative to the repo root, or absolute
# NOSPYFI_KEYSTORE_PASS=...   optional: skips the password prompt, but stores the password in plain text
```

How these values are handled:

- **The scripts read the file themselves.** Both `build-apk.sh` and `release.sh` load it with `set -a`, so its values reach every step of the release.
- **The keystore path never ends up in the app.** Expo also reads `.env.local`, but only `EXPO_PUBLIC_*` variables are bundled into the app.
- **The password is passed as an environment reference** (`env:`), so it never appears in the process list.

The certificate's SHA-256 fingerprint (`20ca537f…2081`) is written in [`scripts/release-publish.sh`](../scripts/release-publish.sh), which refuses to publish an APK signed with anything else.

**Back up the keystore and its password** (a password manager plus an offline copy). Every update must be signed with the same key. NoSpyFi isn't on Google Play, so there's no key reset: a lost key means nobody can update any more, and every user would have to uninstall, losing their favourites.

### Installing on a phone

```sh
pnpm install:apk
```

[`scripts/install-apk.sh`](../scripts/install-apk.sh) installs `dist/NoSpyFi-<version>.apk` with `adb install -r`, which keeps the app's data. It requires **exactly one** authorised USB device; emulators are ignored. For an emulator, run `adb -s emulator-5554 install -r dist/NoSpyFi-<version>.apk` yourself.

Two messages are normal or expected:

- **"Incremental installation not allowed"**, followed by **"Performing Streamed Install … Success"**: adb tries a faster install method first, the phone refuses it, and the fallback works. Harmless.
- **`INSTALL_FAILED_UPDATE_INCOMPATIBLE`**: the installed app was signed with a different key, typically a debug build being replaced by a release build. The script prints the `adb uninstall` command. Uninstalling deletes that phone's favourites and listening time, so the script never does it on its own.

## 5. Versioning

There are two numbers, both in `app.json`:

| Field                                 | Purpose                                                   | Rule                                                                                  |
| ------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `expo.version` (e.g. `0.0.2`)         | Shown to users. Names the APK and the git tag (`v0.0.2`). | Semantic versioning: patch for fixes, minor for features, major for breaking changes. |
| `expo.android.versionCode` (e.g. `2`) | What Android compares.                                    | **+1 on every release.** Android refuses an update whose code isn't higher.           |

`package.json` → `version` mirrors `expo.version`. Nothing reads it; it's kept in step so the repo doesn't show two numbers. `pnpm release` updates all three, so don't edit them by hand.

**Database changes** go in a new entry at the end of `MIGRATIONS` in [`src/db/migrations.ts`](../src/db/migrations.ts). The database runs each migration once, tracked with `PRAGMA user_version`. Never edit an existing migration: an update must carry users' favourites and listening time forward, and there's no cloud backup to restore them from.

## 6. Cutting a release

```sh
pnpm release              # asks for the type; Enter = patch
pnpm release minor        # or patch | major: skips the question
pnpm release 1.0.0        # exact version, e.g. to keep the current number for a first release
```

[`scripts/release.sh`](../scripts/release.sh) runs these steps in order:

1. **Checks that run before anything changes.** Any failure stops the script with a message:
   - the argument is valid;
   - `NOSPYFI_KEYSTORE` is set: releases are never debug-signed;
   - `gh` is installed and logged in (`gh auth status`);
   - the working tree is clean;
   - you're on `main`, level with `origin/main` (it fetches first);
   - the tag `vX.Y.Z` doesn't exist locally or on `origin`.
2. **Release type question.** Asked only if you gave no argument. It shows each resulting version, for example `patch (0.0.3), minor (0.1.0), major (1.0.0) [patch]`; a typo asks again.
3. **`pnpm test`, `pnpm typecheck` and `pnpm lint`.** This is the slow part, so it runs after the question.
4. **Version bump.** It edits only the version fields in `app.json` and `package.json`, leaving the rest of the formatting alone.
5. **Build.** It runs `build-apk.sh` and **offers to install the APK on the USB phone**. Test the app on the phone now: this exact file is what you'll publish.
6. **Release notes.** Your git editor opens (`core.editor`, else `$VISUAL` or `$EDITOR`), like for a commit message, with the commits since the previous tag listed as `#` lines. Write a few lines for users in Markdown; Obtainium shows them as the changelog. Lines starting with `#` are dropped (so no Markdown headings), and **empty notes cancel** the release.
7. **"Publish vX.Y.Z (commit, tag, push and GitHub Release)? [y/N]"**
   - **y:** commits `chore(release): vX.Y.Z` (only `app.json` and `package.json`), creates the annotated tag `vX.Y.Z` (subject `NoSpyFi X.Y.Z`, the notes as its body), pushes the commit and tag in one atomic push, then publishes the GitHub Release ([section 7](#7-publishing-the-github-release)).
   - **n, Enter, Ctrl-C, empty notes or a failed build:** restores `app.json` and `package.json`. Nothing is committed or pushed.

If the push fails (no network, rejected), the commit and tag stay local and the script prints the retry command: `git push --atomic origin main vX.Y.Z && pnpm release:publish vX.Y.Z`. If publishing fails, the tag is already on GitHub but no release is visible, so neither Obtainium nor the app's update check sees anything; the script prints `pnpm release:publish vX.Y.Z` to retry.

## 7. Publishing the GitHub Release

```sh
pnpm release:publish vX.Y.Z   # run by pnpm release; rerun it on its own if that step failed
```

[`scripts/release-publish.sh`](../scripts/release-publish.sh) publishes the release for a tag that is already pushed:

1. **Checks `dist/NoSpyFi-X.Y.Z.apk`** with `apksigner` and `aapt2`: it must be signed with the release key and its versionName must be `X.Y.Z`. This catches a debug-signed `pnpm build:apk`, or another version's build, having replaced the file. On a mismatch it stops and prints the rebuild command.
2. **Already published?** It prints the release's URL and exits successfully, changing nothing.
3. **Creates a draft** from the tag (`--verify-tag`), with the tag's subject as the title and its body as the notes. An existing draft is reused.
4. **Uploads the APK**, replacing a partial upload (`--clobber`). It is the release's only asset: never the `.idsig`. The app's update check looks for exactly one file named `NoSpyFi-X.Y.Z.apk`.
5. **Publishes** the draft as the latest release, never a pre-release (Obtainium ignores pre-releases by default).

The repository must stay **public**, or the README's Download link, Obtainium and the update check can't reach the APK.

### The GitHub token

`gh` uses a fine-grained personal access token that can only touch this repository. Create it once a year:

1. GitHub → **Settings → Developer settings → Fine-grained tokens → Generate new token**.
2. **Expiration:** 1 year. **Repository access:** only `cuginoAle/web-radio`. **Permissions:** Contents → _Read and write_ (Metadata → _Read_ is added automatically).
3. Copy the token, then log `gh` in with it. `--with-token` reads standard input, so the token never appears in your shell history; `gh` keeps it in the macOS Keychain, not in `.env.local`:
   ```sh
   pbpaste | gh auth login --with-token
   gh auth status               # check
   ```
4. Write the new expiry date below.

**Expires:** 2027-11-17. Renew it a month before.

While `gh` is logged in with this token, it can't touch your other repositories.

## 8. How updates reach users

- **The app never checks for updates itself.** It would have to contact a server ([ADR 0004](adr/0004-network-limited-to-directory-and-stations.md)).
- **Obtainium** users add the repository URL once. Obtainium watches GitHub Releases and installs new APKs.
- **Everyone else** downloads the APK from the Releases page and installs it over the old version.
- **An update keeps all data** (favourites, listening time, the catalogue) as long as the signing key and `android.package` are unchanged and `versionCode` is higher.

## 9. Troubleshooting

| Symptom                                                                | Cause and fix                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Set NOSPYFI_KEYSTORE (in .env.local) …`                               | `.env.local` is missing, or doesn't set `NOSPYFI_KEYSTORE`.                                                                                                                                                                                                                                                                                              |
| `The working tree is not clean`                                        | Commit or stash first. Untracked files count too.                                                                                                                                                                                                                                                                                                        |
| `main is not level with origin/main`                                   | Pull, or push your commits, then retry.                                                                                                                                                                                                                                                                                                                  |
| `Tag vX.Y.Z already exists`                                            | That version was already released: pick another bump or version.                                                                                                                                                                                                                                                                                         |
| `gh is missing or not logged in`                                       | Install `gh`, or the token expired: create a new one ([section 7](#the-github-token)). A `401` or `403` from `gh` during publishing has the same cause; rerun `pnpm release:publish vX.Y.Z` after logging in again.                                                                                                                                      |
| `… is not signed with the release key` or `… has versionName …, not …` | `dist/` holds a different build of that version. Rebuild it from the tag as the message says, then rerun `pnpm release:publish vX.Y.Z`.                                                                                                                                                                                                                  |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE`                                   | The installed app has a different signature: uninstall once (this deletes its data).                                                                                                                                                                                                                                                                     |
| `INSTALL_FAILED_INSUFFICIENT_STORAGE`                                  | The device is full. On a phone, free space. On the emulator, uninstalling the app frees little if the old build was small; Android also keeps a low-storage reserve free (500 MB by default), so a nearly full `/data` rejects the 84 MB debug APK. What fixed it here: wipe the AVD (`emulator -avd <name> -wipe-data`), which deletes every app on it. |
| Install rejected as "not newer"                                        | `versionCode` didn't increase: always release through `pnpm release`.                                                                                                                                                                                                                                                                                    |
| The song title never shows                                             | `buildFromSource` for expo-audio was removed, so the patch isn't compiled in.                                                                                                                                                                                                                                                                            |
| GPG error during the commit or tag                                     | Run `pnpm release` in an interactive terminal so the passphrase prompt can appear.                                                                                                                                                                                                                                                                       |
| Build breaks with odd Gradle errors                                    | Another build may be running in the same `android/` folder: wait for it to finish, then rebuild.                                                                                                                                                                                                                                                         |
