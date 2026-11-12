# Radio

Player di web radio per Android: consulta offline una copia locale della directory pubblica Radio Browser e riproduce gli stream in diretta.

## Catalogo

**Stazione** (`Station`):
Una voce della directory, identificata dal suo `stationuuid`. Nell'interfaccia si chiama "radio".
_Avoid_: emittente, canale, stream

**Catalogo** (`Catalog`):
L'insieme delle stazioni consultabili dall'utente: coincide sempre con la generazione attiva.
_Avoid_: database, cache, directory (la directory è Radio Browser)

**Generazione** (`Generation`):
Una copia completa del catalogo prodotta da un singolo download; è *in staging* finché non viene validata, poi *pronta*.
_Avoid_: versione, snapshot, backup

**Generazione attiva** (`ActiveGeneration`):
L'unica generazione pronta che le schermate leggono.
_Avoid_: catalogo corrente, ultima versione

**Riscarica** (`Refresh`):
Download completo della directory in una nuova generazione, avviato dall'utente; non esiste aggiornamento incrementale.
_Avoid_: sincronizzazione, aggiornamento, sync

**Mirror** (`Mirror`):
Un server Radio Browser da cui si scarica una generazione; una generazione proviene da un solo mirror.
_Avoid_: server, endpoint

**Tag** (`Tag`):
Un'etichetta libera assegnata a una stazione dalla directory, normalizzata in una chiave; non è una tassonomia musicale verificata.
_Avoid_: genere, categoria

**Gruppo di tag** (`TagGroup`):
L'insieme delle stazioni della generazione attiva che condividono la stessa chiave di tag. L'interfaccia li presenta come "Generi e tag".
_Avoid_: genere, playlist

## Utente

**Preferito** (`Favorite`):
Una stazione salvata dall'utente o preinstallata con l'app, con l'ultima istantanea utile dei suoi dati; vive indipendentemente dal catalogo.
_Avoid_: segnalibro, salvato

**Preferito non in catalogo** (`MissingFavorite`):
Un preferito il cui UUID non compare nella generazione attiva; resta riproducibile con l'ultima istantanea.
_Avoid_: preferito orfano, preferito rotto

## Ascolto

**Sessione audio** (`AudioSession`):
L'unica istanza di riproduzione dell'app, condivisa da mini-player, player completo, pannello laterale e controlli di sistema.
_Avoid_: player (per l'istanza), riproduttore

**Elenco di origine** (`SourceList`):
La lista di UUID, congelata all'avvio dell'ascolto, da cui precedente e successiva scelgono la stazione adiacente.
_Avoid_: coda, playlist, scaletta
