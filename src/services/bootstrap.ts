import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import Constants from 'expo-constants';
import { openDatabaseAsync } from 'expo-sqlite';

import { prepareDatabase } from '@/db/prepareDatabase';
import { getMetadata } from '@/db/queries/catalog';
import { getStation } from '@/db/queries/stations';
import { seedDefaultFavorites } from '@/db/writes/seedDefaultFavorites';
import { toSnapshot } from '@/helpers/player/toSnapshot';
import { createAudioSession } from '@/services/audio/createAudioSession';
import { createCatalogSync } from '@/services/catalog-sync/createCatalogSync';
import { loadCatalogState } from '@/services/catalog-sync/loadCatalogState';
import { createRadioBrowserClient } from '@/services/radio-browser/createRadioBrowserClient';
import { setRuntime } from '@/services/runtime';
import { globalStore } from '@/state/global-state';

/** Opens the local catalog and wires the single audio session. No network is needed to get past this. */
export async function bootstrap() {
  const db = await openDatabaseAsync('radio.db');
  await prepareDatabase(db);
  await seedDefaultFavorites(db);

  const client = createRadioBrowserClient({
    fetch: (url, init) => fetch(url, init),
    userAgent: `WebRadio/${Constants.expoConfig?.version ?? '1.0.0'}`,
  });
  const audio = createAudioSession({
    player: createAudioPlayer(null),
    store: globalStore,
    reportClick: (uuid) => {
      void getMetadata(db, 'last_mirror')
        .then((mirror) => (mirror ? client.reportClick(mirror, uuid) : undefined))
        .catch(() => undefined);
    },
    resolveStation: async (uuid) => {
      const station = await getStation(db, uuid);
      return station && toSnapshot(station);
    },
  });
  await setAudioModeAsync({
    shouldPlayInBackground: true,
    interruptionMode: 'doNotMixPersistent', // full audio focus, required for lock screen controls
    playsInSilentMode: true,
  });

  setRuntime({ db, audio, sync: createCatalogSync({ db, client }) });
  await loadCatalogState();
}
