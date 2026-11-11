# Spike audio — risultati (step 1)

Data: 10 novembre 2026. Build: release (`./gradlew assembleRelease`, firma debug), Expo SDK 58, expo-audio 58.0.11 (ExoPlayer/media3 1.9.1).
Dispositivo automatico: emulatore `Medium_Phone_API_36.0` (Android 16, API 36), pilotato via `adb` + `uiautomator`.
Dispositivo fisico: OnePlus 5T (Android 15, API 35). APK installato; **prove manuali ancora da fare** (vedi in fondo).

## Matrice stream (emulatore, build release)

| # | Caso | Senza cleartext | Con cleartext |
|---|---|---|---|
| 1 | HTTPS MP3 (laut.fm) | ✅ riproduce | ✅ |
| 2 | HTTPS AAC (Radio France) | ✅ | — |
| 3 | HTTPS → HTTPS redirect 301 | ✅ | — |
| 4 | HTTPS → HTTPS redirect 302 | ✅ | — |
| 5 | HLS con `.m3u8` (RTL) | ✅ | — |
| 6 | HLS senza estensione `.m3u8` | ❌ "Source error" dopo circa 30 s (nessun estrattore: trattato come progressivo) | — |
| 7 | HTTP MP3 | ❌ `CLEARTEXT communication … not permitted` | ✅ |
| 8 | HTTP → HTTP redirect 301 | ❌ cleartext | ✅ |
| 9 | File `.pls` grezzo | ❌ | ❌ "Source error" (nessun parser di playlist, come previsto) |
| 10 | 404 | ❌ "Source error" → stato Errore | — |

Lato JS ogni errore arriva come un generico `"Source error"`: il motivo (cleartext, formato, 404) si vede solo in logcat.

Peso sul catalogo, su un campione delle 1.400 stazioni più ascoltate:
- `url_resolved` HTTP: **34%**. Per questo il cleartext è stato abilitato (ADR 0001).
- HLS senza `.m3u8`: 4 su 1.400.
- `.pls`/`.m3u` residui in `url_resolved`: 4 su 1.400.

## Comportamenti di sistema (emulatore)

| Prova | Esito |
|---|---|
| Notifica media | ✅ Titolo stazione + "Radio in diretta", solo play/pausa, nessun seek. Compare **senza** `POST_NOTIFICATIONS` dichiarato (Android esenta le notifiche di media session) |
| Pausa/play da media key (notifica/lock screen) | ✅ La UI segue. Dopo il play di sistema la UI passa a "playing" solo quando l'audio riparte davvero (qualche secondo di rebuffering) |
| Chiamata in arrivo (`gsm call`) | ✅ Pausa durante la chiamata, ripresa automatica alla fine |
| Rete persa per circa 60 s | ✅ Suona ancora per circa 40–50 s (buffer ExoPlayer), poi Buffering → errore → riconnessione → riprende al ritorno della rete |
| Rete persa a lungo | ✅ 3 errori (interruzione + 2 riconnessioni) → stato Errore stabile, nessun ciclo infinito |
| App in background + schermo spento per 5 min | ✅ Media session PLAYING, player audio attivo per tutto il tempo (supera il limite di circa 3 min di expo-audio senza lock screen) |
| Doze forzato (`deviceidle force-idle`) per 3 min | ✅ Ancora PLAYING oltre la durata del buffer: rete disponibile per il foreground service, nonostante expo-audio non usi un WAKE_LOCK |
| Manifest | ✅ Solo `INTERNET`, `MODIFY_AUDIO_SETTINGS`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK`; nessun `RECORD_AUDIO`; permessi storage/overlay/vibrazione rimossi |

## Limiti noti

- Precedente/successiva non sono disponibili in notifica (limite di expo-audio con un singolo player).
- Niente metadati ICY (brano/artista): si mostra sempre "Radio in diretta".
- HLS senza `.m3u8` e playlist `.pls`/`.m3u` non sono riproducibili: l'utente vede l'errore dopo fino a circa 30 s.
- La ripresa dalla notifica riparte dal buffer, non dal live. La ripresa dall'app torna invece al live.

## Telefono fisico (OnePlus 5T, Android 15) — prove manuali di Alessio

- [x] 15 minuti a schermo bloccato (copre anche il risparmio batteria del ROM in background).
- [x] Controlli sul lock screen (play/pausa) riflessi nella UI.
- [x] Cuffie cablate/Bluetooth scollegate → pausa senza ripresa automatica.
- [ ] Chiamata reale (da provare l'11 novembre 2026).
