# Report di verifica

Data: 10 novembre 2026. APK: `dist/Radio-1.0.0.apk` (52 MB, `armeabi-v7a` + `arm64-v8a`, firma debug).
Stack: Expo SDK 58, React Native 0.88, expo-audio 58.0.11, expo-sqlite 58.0.15.

## Comandi eseguiti

| Comando | Esito |
|---|---|
| `pnpm test` | 108 test verdi, 9 suite |
| `pnpm typecheck` | verde |
| `pnpm lint` | verde |
| `pnpm build:apk` | riuscito |
| `pnpm android` | **non eseguito**: le verifiche sono state fatte su build release |

## Dispositivi

| Dispositivo | Uso |
|---|---|
| Emulatore `Medium_Phone_API_36.0`, Android 16 | prove guidate via `adb` sull'APK release |
| Stesso emulatore con `wm size 3000x1800` (circa 1143×686 dp) | layout tablet landscape. **Nessun tablet vero provato** |
| OnePlus 5T, Android 15 | prove manuali di Alessio sulla build dello spike audio |

## Misure (non sono promesse)

| Misura | Valore |
|---|---|
| Stazioni scaricate | 53.452 |
| Primo download reale | 64 s (emulatore su Wi-Fi) |
| Riscarica con audio attivo | completata entro 115 s, audio sempre attivo |
| Query su 53.000 righe sintetiche (sul Mac, non sul dispositivo) | prima pagina 0,1 ms; ricerca senza risultati 2,7 ms; tag 9 ms; top tag 10 ms; tutti gli UUID 17 ms |
| Contrasto minimo dei testi | 6,7:1 |

Le query usano gli indici (`EXPLAIN QUERY PLAN`): FTS per ora non serve. Lo spazio occupato sul dispositivo non è stato misurato (build release non ispezionabile).

## Criteri di accettazione (handover §9)

Legenda: **T** test automatici, **E** emulatore, **F** telefono fisico.

| Criterio | Esito | Evidenza |
|---|---|---|
| Primo download con progresso reale | ✅ | E, T |
| Primo avvio offline recuperabile, senza catalogo finto | ✅ | E, T |
| Con cache, avvio e consultazione senza rete | ✅ | E |
| UUID duplicati; fallback dei metadati | ✅ | T |
| Più tag per radio; ricerca AND tag | ✅ | T |
| Ricerca: maiuscole, accenti, `%`/`_`; vuoto distinto da errore | ✅ | T |
| Preferiti coerenti, persistenti, usabili offline | ✅ | E, T |
| Interruzione, annullamento, risposta non valida non sostituiscono il catalogo | ✅ | T |
| Disco pieno | ⚠️ non simulato | passa dallo stesso percorso di errore |
| Crash prima e dopo lo switch | ✅ | T (simulato) |
| Refresh conserva i preferiti; stazione scomparsa con snapshot e avviso | ✅ | T |
| Toggle preferito durante il download | ✅ | T (tra una pagina e l'altra) |
| Niente sincronizzazioni concorrenti; cambio mirror con staging pulito | ✅ | T |
| Riscaricare non interrompe l'audio | ✅ | E |
| Una sola sessione; cambio rapido di radio | ✅ | T; cambio rapido non provato su dispositivo |
| Buffering, errori, pausa, limite dei tentativi | ✅ | E, T |
| Nessun brano inventato, nessun seek, nessun pulsante finto | ✅ | E, T |
| Leggibilità con testo ingrandito; rotazione senza perdere audio/ricerca/tab | ✅ | E (testo a 1,6×, rotazione reale) |
| 15 min in background a schermo bloccato | ✅ | F |
| Play/pausa da notifica e lock screen | ✅ | F, E |
| Cuffie e Bluetooth | ✅ | F |
| Chiamate reali | ⏳ da fare | F; simulata su E: pausa e ripresa |
| Risultati per HTTPS, HTTP, redirect, codec, rete instabile | ✅ | [spike-audio.md](spike-audio.md) |
| Etichette, contrasto, 48 dp | ✅ | T, calcolo |
| TalkBack | ⏳ da fare | serve una prova manuale |

## Limiti residui

- Le prove su telefono risalgono alla build dello spike: la sessione audio è la stessa, ma l'app completa non è stata ancora provata a schermo bloccato.
- Il layout a tre colonne richiede almeno 900×600 dp in unità scalate: un telefono grande in landscape resta compatto, altrimenti i controlli del player finirebbero sotto la piega.
- Cambiare la densità dello schermo con l'app aperta ricrea l'Activity e riporta su Scopri (ricerca e audio restano). La rotazione non è interessata.
- HLS senza `.m3u8` e file `.pls`/`.m3u` mostrano un errore.
- Radio Browser oggi espone un solo mirror verificato: se è giù, il download non è possibile.
- Le voci duplicate per nome in elenco sono stazioni distinte nella directory (UUID diversi).
