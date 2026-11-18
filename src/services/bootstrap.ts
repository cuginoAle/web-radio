import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import Constants from 'expo-constants';
import { openDatabaseAsync } from 'expo-sqlite';

import { prepareDatabase } from '@/db/prepareDatabase';
import { getLastStation, setLastStation } from '@/db/queries/lastStation';
import { addListeningTime } from '@/db/queries/listeningTime';
import { getStation } from '@/db/queries/stations';
import { seedDefaultFavorites } from '@/db/writes/seedDefaultFavorites';
import { toSnapshot } from '@/helpers/player/toSnapshot';
import { autostart } from '@/services/audio/autostart';
import { createAudioSession } from '@/services/audio/createAudioSession';
import { rememberLastStation } from '@/services/audio/rememberLastStation';
import { trackListening } from '@/services/audio/trackListening';
import { createCatalogSync } from '@/services/catalog-sync/createCatalogSync';
import { loadCatalogState } from '@/services/catalog-sync/loadCatalogState';
import { createRadioBrowserClient } from '@/services/radio-browser/createRadioBrowserClient';
import { setRuntime } from '@/services/runtime';
import { createUpdateCheck } from '@/services/update-check/createUpdateCheck';
import { createInstaller } from '@/services/update-install/createInstaller';
import { globalStore } from '@/state/global-state';

/** Opens the local catalog and wires the single audio session. No network is needed to get past this. */
export async function bootstrap() {
  const db = await openDatabaseAsync('radio.db');
  await prepareDatabase(db);
  await seedDefaultFavorites(db);

  const userAgent = `NoSpyFi/${Constants.expoConfig?.version ?? '1.0.0'}`;
  const client = createRadioBrowserClient({ fetch: (url, init) => fetch(url, init), userAgent });
  const updates = createUpdateCheck({
    db,
    fetch: (url, init) => fetch(url, init),
    userAgent,
    installedVersion: Constants.expoConfig?.version ?? 'unknown', // unparseable: never "newer"
  });
  const resolveStation = async (uuid: string) => {
    const station = await getStation(db, uuid);
    return station && toSnapshot(station);
  };
  const audio = createAudioSession({ player: createAudioPlayer(null), store: globalStore, resolveStation });
  trackListening(globalStore, (uuid, seconds) => void addListeningTime(db, uuid, seconds).catch(() => undefined));
  rememberLastStation(globalStore, (station) => void setLastStation(db, station).catch(() => undefined));
  await setAudioModeAsync({
    shouldPlayInBackground: true,
    interruptionMode: 'doNotMixPersistent', // full audio focus, required for lock screen controls
    playsInSilentMode: true,
  });

  const installer = createInstaller();
  void installer.discard(); // after an update installs, the 56 MB APK is dead weight (discard never throws)

  setRuntime({ db, audio, sync: createCatalogSync({ db, client }), updates, installer });
  await loadCatalogState();
  // Bootstrap runs once per process, so this fires on a cold start only; the splash covers it, so no tap can race it.
  await autostart(audio, await getLastStation(db), resolveStation).catch(() => undefined);
}
