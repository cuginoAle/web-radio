# Patching expo-audio to read the now-playing track

`expo-audio` (SDK 58) does not expose the stream's ICY metadata (`StreamTitle`) to JS, and Radio Browser offers no "now playing" API. We therefore apply a patch (`pnpm patch`) to the Android code of `expo-audio` that forwards to JS, as a new event, the metadata received by the internal ExoPlayer.

## Rejected options

- **Replacing expo-audio with react-native-track-player**: it exposes the metadata, but requires rewriting the audio session and the system controls.
- **A second HTTP connection from JS with `Icy-MetaData: 1`**: doubles the traffic, and `fetch` streaming in React Native is unreliable.

## Consequences

`expo-audio` ships with a precompiled AAR (`local-maven-repo`) that would ignore the Kotlin patch: in `package.json`, `expo.autolinking.android.buildFromSource: ["expo-audio"]` forces it to build from source. If the patch is removed, that line must be removed too.

On every Expo SDK update the patch must be reapplied and verified by hand on the emulator with a station that sends `StreamTitle`; if a future version of `expo-audio` exposes the metadata, the patch should be removed.
