import { prepareDatabase } from '@/db/prepareDatabase';
import { createAudioSession, type AudioSession } from '@/services/audio/createAudioSession';
import { createCatalogSync } from '@/services/catalog-sync/createCatalogSync';
import { loadCatalogState } from '@/services/catalog-sync/loadCatalogState';
import { getStation } from '@/db/queries/stations';
import { toSnapshot } from '@/helpers/player/toSnapshot';
import { setRuntime } from '@/services/runtime';
import { globalStore } from '@/state/global-state';
import { FakeAudioPlayer } from '@test/fakes/fakeAudioPlayer';
import { createFakeDirectory } from '@test/fakes/fakeDirectory';
import type { RawStation } from '@test/fixtures/radioBrowserStation';
import { createNodeDb } from '@test/sqlite/nodeDb';

/** The whole app below the UI: real SQLite, sync, session and store; only network and native audio are fake. */
export async function startTestApp(stations: RawStation[] = []) {
  globalStore.setState(globalStore.getInitialState(), true);
  const { db } = createNodeDb();
  await prepareDatabase(db);
  const directory = createFakeDirectory({ mirror: stations });
  const sync = createCatalogSync({ db, client: directory.client });
  const player = new FakeAudioPlayer();
  const audio: AudioSession = createAudioSession({
    player,
    store: globalStore,
    resolveStation: async (uuid) => {
      const station = await getStation(db, uuid);
      return station && toSnapshot(station);
    },
  });
  setRuntime({ db, audio, sync });
  if (stations.length > 0) await sync.refresh();
  await loadCatalogState();
  return { db, directory, sync, player, audio, state: () => globalStore.getState() };
}
