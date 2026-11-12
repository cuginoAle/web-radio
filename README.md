# Radio

Player di web radio per Android (smartphone e tablet landscape), in italiano. Il catalogo viene scaricato da [Radio Browser](https://www.radio-browser.info/) e salvato sul dispositivo: ricerca, generi/tag e preferiti funzionano offline, l'audio è sempre in streaming.

Pensato anche per i box auto: la barra di navigazione di Android è nascosta dall'avvio e, nel layout largo, la barra laterale ha un orologio e un tasto "Torna alle app" che manda l'app in background senza fermare l'audio.

Specifica: [docs/radio-handover/web-radio-react-native-handover.md](docs/radio-handover/web-radio-react-native-handover.md). Linguaggio di dominio: [GLOSSARY.md](GLOSSARY.md). Decisioni: [docs/adr/](docs/adr/). Prove native: [docs/spike-audio.md](docs/spike-audio.md).

## Requisiti

- Node 22.13 o successivo (i test usano `node:sqlite`) e pnpm 11
- JDK 17 e Android SDK con `ANDROID_HOME` impostato
- Un dispositivo o emulatore Android: **Expo Go non basta**, l'audio in background richiede una build nativa

## Comandi

| Comando | Cosa fa |
|---|---|
| `pnpm install` | Installa le dipendenze |
| `pnpm android` | Genera `android/`, compila una build di sviluppo e la avvia sul dispositivo |
| `pnpm start` | Avvia Metro per una build di sviluppo già installata |
| `pnpm test` | Test automatici (Jest; SQLite vero tramite `node:sqlite`) |
| `pnpm typecheck` | Controllo dei tipi |
| `pnpm lint` | ESLint |

### APK release installabile

```sh
pnpm build:apk    # rigenera android/ e crea dist/Radio-<versione>.apk, poi chiede se installarlo
pnpm install:apk  # lo installa sull'unico dispositivo collegato via USB (emulatori ignorati)
```

Ogni build sostituisce l'APK della stessa versione in `dist/`. L'APK è firmato con il keystore di debug: si può installare sui propri dispositivi ma non pubblicare sul Play Store. La cartella `android/` è generata da `app.json` e non è versionata.

## Struttura

```
src/app/         solo route (Expo Router)
src/screens/     container delle schermate e relativi sotto-componenti
src/components/  componenti riutilizzabili
src/hooks/       hook raggruppati per concetto
src/helpers/     funzioni pure (normalizzazione, ricerca, player)
src/db/          schema SQLite, query, scritture delle generazioni
src/services/    client Radio Browser, Riscarica, sessione audio, avvio
src/state/       l'unico store Zustand (ADR 0002)
src/theme/       token di colori, spaziature, tipografia
test/            fake dei confini di sistema e adattatore node:sqlite
```

## Limiti noti

- HTTP in chiaro abilitato globalmente: necessario per circa un terzo delle stazioni ([ADR 0001](docs/adr/0001-global-cleartext-http.md)).
- HLS senza estensione `.m3u8` e file `.pls`/`.m3u` non sono riproducibili: l'app mostra un errore.
- Niente brano/artista (expo-audio non espone i metadati ICY) e niente precedente/successiva in notifica.
- Il numero di radio descrive la copia scaricata: la directory è comunitaria e non garantisce completezza.

## Dati

Catalogo: Radio Browser. Gli stream, i loghi e le registrazioni appartengono alle rispettive emittenti.
