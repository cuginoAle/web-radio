# Patch di expo-audio per leggere il brano in onda

`expo-audio` (SDK 58) non espone a JS i metadati ICY dello stream (`StreamTitle`), e Radio Browser non offre un'API "in onda". Applichiamo quindi una patch (`pnpm patch`) al codice Android di `expo-audio` che inoltra a JS, come nuovo evento, i metadati ricevuti dall'ExoPlayer interno.

## Opzioni scartate

- **Sostituire expo-audio con react-native-track-player**: espone i metadati, ma richiede di riscrivere sessione audio e controlli di sistema.
- **Seconda connessione HTTP da JS con `Icy-MetaData: 1`**: raddoppia il traffico e lo streaming di `fetch` in React Native è inaffidabile.

## Conseguenze

`expo-audio` arriva con un AAR precompilato (`local-maven-repo`) che ignorerebbe la patch Kotlin: in `package.json` `expo.autolinking.android.buildFromSource: ["expo-audio"]` lo forza a compilare dai sorgenti. Togliendo la patch va tolta anche quella riga.

A ogni aggiornamento dell'SDK Expo la patch va riapplicata e verificata a mano sull'emulatore con una stazione che invia `StreamTitle`; se una versione futura di `expo-audio` espone i metadati, la patch va rimossa.
