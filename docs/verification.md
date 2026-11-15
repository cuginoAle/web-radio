# Verification report

Date: 10 November 2026. APK: `dist/Radio-1.0.0.apk` (52 MB, `armeabi-v7a` + `arm64-v8a`, debug signing).
Stack: Expo SDK 58, React Native 0.88, expo-audio 58.0.11, expo-sqlite 58.0.15.

## Commands run

| Command | Outcome |
|---|---|
| `pnpm test` | 108 tests green, 9 suites |
| `pnpm typecheck` | green |
| `pnpm lint` | green |
| `pnpm build:apk` | succeeded |
| `pnpm android` | **not run**: checks were done on release builds |

## Devices

| Device | Use |
|---|---|
| Emulator `Medium_Phone_API_36.0`, Android 16 | tests driven via `adb` on the release APK |
| Same emulator with `wm size 3000x1800` (about 1143×686 dp) | tablet landscape layout. **No real tablet tested** |
| OnePlus 5T, Android 15 | Alessio's manual tests on the audio spike build |

## Measurements (not promises)

| Measurement | Value |
|---|---|
| Stations downloaded | 53,452 |
| First real download | 64 s (emulator on Wi-Fi) |
| Refresh with audio playing | completed within 115 s, audio always playing |
| Queries on 53,000 synthetic rows (on the Mac, not on the device) | first page 0.1 ms; search with no results 2.7 ms; tag 9 ms; top tags 10 ms; all UUIDs 17 ms |
| Minimum text contrast | 6.7:1 |

The queries use the indexes (`EXPLAIN QUERY PLAN`): FTS is not needed for now. The space used on the device was not measured (release build cannot be inspected).

## Acceptance criteria (handover §9)

Key: **T** automated tests, **E** emulator, **F** physical phone.

| Criterion | Outcome | Evidence |
|---|---|---|
| First download with real progress | ✅ | E, T |
| First offline launch recoverable, with no fake catalogue | ✅ | E, T |
| With cache, launch and browsing without network | ✅ | E |
| Duplicate UUIDs; metadata fallback | ✅ | T |
| Multiple tags per station; search AND tag | ✅ | T |
| Search: case, accents, `%`/`_`; empty distinct from error | ✅ | T |
| Favourites consistent, persistent, usable offline | ✅ | E, T |
| Interruption, cancellation, invalid response do not replace the catalogue | ✅ | T |
| Disk full | ⚠️ not simulated | goes through the same error path |
| Crash before and after the switch | ✅ | T (simulated) |
| Refresh keeps favourites; vanished station with snapshot and warning | ✅ | T |
| Favourite toggle during download | ✅ | T (between one page and the next) |
| No concurrent syncs; mirror change with clean staging | ✅ | T |
| Refreshing does not interrupt audio | ✅ | E |
| A single session; rapid station switching | ✅ | T; rapid switching not tried on device |
| Buffering, errors, pause, retry limit | ✅ | E, T |
| No invented tracks, no seek, no fake buttons | ✅ | E, T |
| Legibility with enlarged text; rotation without losing audio/search/tab | ✅ | E (text at 1.6×, real rotation) |
| 15 min in background with screen locked | ✅ | F |
| Play/pause from notification and lock screen | ✅ | F, E |
| Headphones and Bluetooth | ✅ | F |
| Real calls | ⏳ to do | F; simulated on E: pause and resume |
| Results for HTTPS, HTTP, redirects, codecs, unstable network | ✅ | [spike-audio.md](spike-audio.md) |
| Labels, contrast, 48 dp | ✅ | T, calculation |
| TalkBack | ⏳ to do | needs a manual test |

## Remaining limitations

- The phone tests date from the spike build: the audio session is the same, but the full app has not yet been tried with the screen locked.
- The three-column layout activates with any landscape window (including phones and short car boxes): in the side panel the artwork is the only control (pause / resume / retry), with no status or previous/next: to change station you tap the list.
- Changing the screen density with the app open recreates the Activity and returns to Discover (search and audio are kept). Rotation is not affected.
- HLS without `.m3u8` and `.pls`/`.m3u` files show an error.
- Radio Browser currently exposes only one verified mirror: if it is down, downloading is not possible.
- Entries duplicated by name in the list are distinct stations in the directory (different UUIDs).
