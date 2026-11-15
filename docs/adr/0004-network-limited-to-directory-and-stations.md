# The app talks only to the directory and the stations

NoSpyFi is published as a privacy-respecting app, and the README lists everything that leaves the phone. The app therefore contacts only a Radio Browser mirror (when the user downloads or refreshes the catalogue), the stream being played and the hosts of station logos. To keep that true we removed the directory click report (`/json/url/<uuid>`, sent on every play), turned off Android Auto Backup (`android.allowBackup: false`), and deliver updates through GitHub Releases instead of an in-app update check or EAS Update.

## Considered options

- **Keep the click report**, which feeds Radio Browser's popularity ranking: rejected, it told a third party what you listen to and when, from your IP address.
- **Make the click report opt-in**: rejected, a setting nobody asked for.
- **Strip tracking parameters from stream URLs**: rejected. A refresh overwrites favourites' URLs with the directory's copy, and removing parameters can break a stream. The README discloses that stream URLs are passed through as the broadcaster registered them.

## Consequences

- Any new network call must be added to the README's "What leaves your phone" table, or the README stops being true.
- Favourites and listening time do not move to a new phone automatically.
- The app cannot tell users that an update exists: the README points them to Obtainium or the Releases page.
