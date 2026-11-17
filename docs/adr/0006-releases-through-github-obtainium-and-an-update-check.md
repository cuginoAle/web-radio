# Releases reach users through GitHub Releases, Obtainium and an in-app update check

NoSpyFi's audience, in order, is privacy-minded Android users who already run F-Droid or Obtainium, then car head-unit owners (often without Google services, sometimes on Android 7), then non-technical people. Each needs to hear about an update and install it with one tap. We ship every release as one APK signed with our release key and published as a GitHub Release. **Obtainium is the primary channel**: the README leads with it, and `pnpm release` publishes the GitHub Release itself so no manual step stands between a tag and Obtainium. Obtainium needs Android 8.0 and a second app, so the Android app also gets an **in-app update check** for everyone else: on open it looks for a newer release, shows a notice, and with one tap downloads the APK and hands it to Android's installer. This supersedes the "updates through GitHub Releases instead of an in-app update check" part of [ADR 0004](0004-network-limited-to-directory-and-stations.md). The repository goes public before the first public release, because GitHub Releases, Obtainium and the README's claim that "the code is open" all depend on it.

## Considered options

- **IzzyOnDroid**: rejected. Its inclusion policy opposes apps built partly with generative AI, and NoSpyFi is developed with AI coding agents. It also caps APKs at about 30 MB (ours is about 56 MB).
- **Our own F-Droid-format repo on a VPS**: rejected. It would only spare F-Droid users from installing Obtainium, at the cost of a server, a monthly fee and a second (index) key to guard.
- **F-Droid main repo**: deferred to a separate effort. It's the best discovery route for our first audience, but F-Droid accepts apps only after 3 months of activity (not before 2027-02-11), and it would sign with its own key unless we produce a byte-identical reproducible Linux build. We won't take F-Droid's key (see Consequences).
- **The update check with background checks, system notifications and unattended installs**: not chosen. It would take 4–6 days of work, native code, and either Firebase or hand-written notifications. People open a radio player most days, so a notice when they open it arrives about as fast.
- **No fallback for Android 7**: rejected. Head units on Android 7 would have to update by hand.

## Consequences

- One signing key for every channel. Users never have to reinstall to switch channels, so no export/import feature is needed first. A channel that would re-sign with its own key stays out until it can ship ours.
- The update check is a new network call: it gets a row in the README's "What leaves your phone", and the app gains the `REQUEST_INSTALL_PACKAGES` permission. It stays off until the user turns it on (asked on the welcome screen, changeable later from the ⓘ screen) and asks GitHub's latest-release API at most once a day when the app is opened. Because it is opt-in, a future F-Droid build can keep it: F-Droid forbids update downloads only without opt-in.
- Installing an update stops playback, and the user must switch on "Install unknown apps" for NoSpyFi once.
- Losing the release key means every user must reinstall, which deletes their favourites and listening time.
