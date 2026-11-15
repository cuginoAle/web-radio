# Audio spike — results (step 1)

Date: 10 November 2026. Build: release (`./gradlew assembleRelease`, debug signing), Expo SDK 58, expo-audio 58.0.11 (ExoPlayer/media3 1.9.1).
Automated device: emulator `Medium_Phone_API_36.0` (Android 16, API 36), driven via `adb` + `uiautomator`.
Physical device: OnePlus 5T (Android 15, API 35). APK installed; **manual tests still to be done** (see the end).

## Stream matrix (emulator, release build)

| # | Case | Without cleartext | With cleartext |
|---|---|---|---|
| 1 | HTTPS MP3 (laut.fm) | ✅ plays | ✅ |
| 2 | HTTPS AAC (Radio France) | ✅ | — |
| 3 | HTTPS → HTTPS 301 redirect | ✅ | — |
| 4 | HTTPS → HTTPS 302 redirect | ✅ | — |
| 5 | HLS with `.m3u8` (RTL) | ✅ | — |
| 6 | HLS without `.m3u8` extension | ❌ "Source error" after about 30 s (no extractor: treated as progressive) | — |
| 7 | HTTP MP3 | ❌ `CLEARTEXT communication … not permitted` | ✅ |
| 8 | HTTP → HTTP 301 redirect | ❌ cleartext | ✅ |
| 9 | Raw `.pls` file | ❌ | ❌ "Source error" (no playlist parser, as expected) |
| 10 | 404 | ❌ "Source error" → Error state | — |

On the JS side every error arrives as a generic `"Source error"`: the reason (cleartext, format, 404) is only visible in logcat.

Weight in the catalogue, on a sample of the 1,400 most listened-to stations:
- HTTP `url_resolved`: **34%**. This is why cleartext was enabled (ADR 0001).
- HLS without `.m3u8`: 4 out of 1,400.
- Residual `.pls`/`.m3u` in `url_resolved`: 4 out of 1,400.

## System behaviours (emulator)

| Test | Outcome |
|---|---|
| Media notification | ✅ Station title + "Live radio", play/pause only, no seek. It appears **without** `POST_NOTIFICATIONS` declared (Android exempts media session notifications) |
| Pause/play from media key (notification/lock screen) | ✅ The UI follows. After a system play the UI switches to "playing" only when audio actually resumes (a few seconds of rebuffering) |
| Incoming call (`gsm call`) | ✅ Pauses during the call, resumes automatically at the end |
| Network lost for about 60 s | ✅ Still plays for about 40–50 s (ExoPlayer buffer), then Buffering → error → reconnection → resumes when the network returns |
| Network lost for a long time | ✅ 3 errors (interruption + 2 reconnections) → stable Error state, no infinite loop |
| App in background + screen off for 5 min | ✅ Media session PLAYING, audio player active the whole time (exceeds expo-audio's limit of about 3 min without lock screen) |
| Forced Doze (`deviceidle force-idle`) for 3 min | ✅ Still PLAYING beyond the buffer length: network available to the foreground service, even though expo-audio does not use a WAKE_LOCK |
| Manifest | ✅ Only `INTERNET`, `MODIFY_AUDIO_SETTINGS`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK`; no `RECORD_AUDIO`; storage/overlay/vibration permissions removed |

## Known limitations

- Previous/next are not available in the notification (an expo-audio limitation with a single player).
- No ICY metadata (track/artist): "Live radio" is always shown.
- HLS without `.m3u8` and `.pls`/`.m3u` playlists cannot be played: the user sees the error after up to about 30 s.
- Resuming from the notification restarts from the buffer, not from live. Resuming from the app returns to live instead.

## Physical phone (OnePlus 5T, Android 15) — Alessio's manual tests

- [x] 15 minutes with the screen locked (also covers the ROM's background battery saving).
- [x] Lock screen controls (play/pause) reflected in the UI.
- [x] Wired/Bluetooth headphones disconnected → pause with no automatic resume.
- [ ] Real call (to be tried on 11 November 2026).
