# NoSpyFi

A web radio player for Android: it browses a local copy of the public Radio Browser directory offline and plays live streams.

## Product

**Android app**:
NoSpyFi installed on an Android phone, tablet or car head unit.
_Avoid_: mobile app, native app

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

**Popularity** (`Popularity`):
How many times Radio Browser listeners opened a station in the 24 hours before the refresh that produced the active generation; it stays the same until the next refresh. Catalogue lists show the most popular stations first.
_Avoid_: votes, ranking, trending

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

**Last station** (`LastStation`):
The station most recently audible in the audio session, remembered after the app closes. Pausing, a station that fails to play and a catalogue refresh do not change it.
_Avoid_: last played, recent station, history

**Autostart** (`Autostart`):
The audio session playing the last station on its own when the app starts fresh. Bringing an app that is still running back to the front does not autostart it.
_Avoid_: autoplay, resume (resume means un-pausing)

**Closing the app**:
Swiping NoSpyFi away from the recent apps screen, playing or paused. It ends the audio session and the app with it, so the next open is a fresh start that autostarts the last station.
_Avoid_: kill, quit, exit, force stop (Android's own Settings action)

**Listening time** (`ListeningTime`):
The all-time total of seconds during which a station's audio was actually audible; it applies to any station, favourite or not. Loading, buffering and pausing do not count.
_Avoid_: play time, history, statistics

**Top favourite** (`TopFavorite`):
One of the (at most) six favourites with the highest listening time, provided it is greater than zero. In the interface: "Most played".
_Avoid_: top fav, main favourite

**Now playing** (`NowPlaying`):
The text the stream itself announces as currently on air (usually "artist - title"); it may be missing, a slogan or an advert. It is neither verified nor stored.
_Avoid_: track, song, metadata

**Spectrum** (`Spectrum`):
The band levels of the audio the audio session is playing right now, measured from the decoded stream and never from the microphone; it is neither stored nor sent anywhere.
_Avoid_: equalizer, visualiser, waveform

## Distribution

**Release**:
A published, signed version of the Android app, identified by its version number.
_Avoid_: build, APK

**App update**:
Installing a newer release over the installed one, keeping favourites and listening time. Not to be confused with a catalogue refresh.
_Avoid_: upgrade, refresh

**Channel**:
Where a user installs releases from and receives app updates through.
_Avoid_: store, source, repo, market

**Update notice**:
How a user learns that a newer release exists: a system notification from their channel's client, or a notice in the app, shown when they open it or after they tap *Check now*.
_Avoid_: update alert, update prompt

**Update check**:
The app asking whether a newer release exists, either by itself at most once a day if the user turned it on, or right away when the user taps *Check now*.
_Avoid_: auto-update, updater, update server, force check
