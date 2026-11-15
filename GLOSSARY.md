# NoSpyFi

A web radio player for Android: it browses a local copy of the public Radio Browser directory offline and plays live streams.

## Catalogue

**Station** (`Station`):
An entry in the directory, identified by its `stationuuid`. The interface calls it a "station".
_Avoid_: broadcaster, channel, stream

**Catalogue** (`Catalog`):
The set of stations the user can browse: it always coincides with the active generation.
_Avoid_: database, cache, directory (the directory is Radio Browser)

**Generation** (`Generation`):
A complete copy of the catalogue produced by a single download; it is *staging* until validated, then *ready*.
_Avoid_: version, snapshot, backup

**Active generation** (`ActiveGeneration`):
The one ready generation that the screens read.
_Avoid_: current catalogue, latest version

**Refresh** (`Refresh`):
A full download of the directory into a new generation, started by the user (the "Refresh catalogue" button); there is no incremental update.
_Avoid_: sync, update, synchronisation

**Mirror** (`Mirror`):
A Radio Browser server that a generation is downloaded from; a generation comes from a single mirror.
_Avoid_: server, endpoint

**Tag** (`Tag`):
A free-form label assigned to a station by the directory, normalised into a key; it is not a verified musical taxonomy.
_Avoid_: genre, category

**Tag group** (`TagGroup`):
The set of stations in the active generation that share the same tag key. The interface presents them as "Genres & tags".
_Avoid_: genre, playlist

## User

**Favourite** (`Favorite`):
A station saved by the user or preinstalled with the app, together with the latest useful snapshot of its data; it lives independently of the catalogue.
_Avoid_: bookmark, saved

**Missing favourite** (`MissingFavorite`):
A favourite whose UUID does not appear in the active generation; it remains playable using its latest snapshot.
_Avoid_: orphaned favourite, broken favourite

## Listening

**Audio session** (`AudioSession`):
The app's single playback instance, shared by the mini-player, the full player, the side panel and the system controls.
_Avoid_: player (for the instance)

**Source list** (`SourceList`):
The list of UUIDs, frozen when listening starts, from which previous and next pick the adjacent station.
_Avoid_: queue, playlist

**Listening time** (`ListeningTime`):
The all-time total of seconds during which a station's audio was actually audible; it applies to any station, favourite or not. Loading, buffering and pausing do not count.
_Avoid_: play time, history, statistics

**Top favourite** (`TopFavorite`):
One of the (at most) six favourites with the highest listening time, provided it is greater than zero. In the interface: "Most played".
_Avoid_: top fav, main favourite

**Now playing** (`NowPlaying`):
The text the stream itself announces as currently on air (usually "artist - title"); it may be missing, a slogan or an advert. It is neither verified nor stored.
_Avoid_: track, song, metadata
