# Traffico HTTP in chiaro abilitato globalmente

Lo spike audio (`docs/spike-audio.md`) ha confermato che, su una build release, Android blocca gli stream `http://` ("CLEARTEXT communication … not permitted by network security policy"). Il 34% delle 1.400 stazioni più ascoltate del catalogo usa un URL HTTP, su host arbitrari che non si possono elencare in anticipo.

Abbiamo quindi abilitato `android.usesCleartextTraffic` tramite `expo-build-properties`, con l'approvazione esplicita richiesta dall'handover (§7). Expo non offre un'eccezione per host arbitrari che non sia globale.

## Consequences

- Stream e favicon HTTP possono essere letti o manomessi sulla rete. L'app riproduce solo audio e immagini e non invia dati personali, quindi il rischio è limitato al contenuto ricevuto.
- Le chiamate alla directory Radio Browser restano sempre HTTPS: il client non accetta mirror `http://`.
- Gli URL HTTP non vengono convertiti automaticamente in HTTPS.
