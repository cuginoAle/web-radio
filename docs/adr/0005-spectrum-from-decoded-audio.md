# The spectrum is measured from the decoded audio, not with the Visualizer

The player shows a spectrum behind the station being played. `expo-audio` already offers audio sampling (`useAudioSampleListener`), but on Android it is built on `android.media.audiofx.Visualizer`, which requires the `RECORD_AUDIO` permission and a runtime prompt. An app called NoSpyFi, whose README promises "no microphone", cannot ask for it. We therefore widened the `expo-audio` patch of [ADR 0003](0003-patch-expo-audio-icy-metadata.md): a tap on ExoPlayer's audio pipeline (`TeeAudioProcessor`) reads the decoded samples on their way to the speaker, computes the band levels in Kotlin and forwards them to JS as a new event.

## Rejected options

- **`Visualizer` sampling as shipped by expo-audio**: the least code, but it needs the microphone permission.
- **A decorative animation**: no native work, but it would not follow the music and would keep moving through silence.
- **Sending raw samples and computing the bands in JS**: testable in Jest, but about 20,000 samples a second cross to JS and the FFT competes with scrolling.

## Consequences

- The patch now also adds `SpectrumBands.kt` (the maths, plain Kotlin) and `SpectrumTap.kt`, a renderers factory on the player, and `setSpectrumEnabled` / `spectrumUpdate` on the JS side. Everything in ADR 0003 about `buildFromSource` and re-verifying on each Expo SDK update applies to it too.
- The audio reaches the tap before it is heard (about 0.4 s earlier on the emulator), so each measurement is held back until the audio sink's clock reaches it. If the bars ever run ahead of the sound, look there first.
- Nothing is measured unless a spectrum is on screen and the app is in the foreground: listening with the screen off costs no extra battery.
- The band maths has no automated test in the repo (the patch has no test harness). It was checked once on a plain JVM with test tones; re-check it by hand if the bands or the window change.
- The permissions line in the README stays true, and nothing new leaves the phone.
