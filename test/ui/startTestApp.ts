import { prepareDatabase } from '@/db/prepareDatabase';
import { createAudioSession, type AudioSession } from '@/services/audio/createAudioSession';
import { createCatalogSync } from '@/services/catalog-sync/createCatalogSync';
import { loadCatalogState } from '@/services/catalog-sync/loadCatalogState';
import { getStation } from '@/db/queries/stations';
import { toSnapshot } from '@/helpers/player/toSnapshot';
import { setRuntime } from '@/services/runtime';
import { createUpdateCheck } from '@/services/update-check/createUpdateCheck';
import { globalStore } from '@/state/global-state';
import { FakeAudioPlayer } from '@test/fakes/fakeAudioPlayer';
import { createFakeDirectory } from '@test/fakes/fakeDirectory';
import { createFakeFetch } from '@test/fakes/fakeFetch';
import { createFakeInstaller } from '@test/fakes/fakeInstaller';
import type { RawStation } from '@test/fixtures/radioBrowserStation';
import { createNodeDb } from '@test/sqlite/nodeDb';

/** The whole app below the UI: real SQLite, sync, session and store; only network and native audio are fake. */
export async function startTestApp(stations: RawStation[] = []) {
  const github = createFakeFetch(); // an empty queue throws on use, which the Update check swallows
  const clock = { now: 1_700_000_000_000 };
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
  const updates = createUpdateCheck({
    db,
    fetch: github.fetch,
    userAgent: 'NoSpyFi/1.2.3',
    installedVersion: '1.2.3',
    now: () => clock.now,
  });
  const device = createFakeInstaller();
  setRuntime({ db, audio, sync, updates, installer: device.installer });
  if (stations.length > 0) await sync.refresh();
  await loadCatalogState();
  return { db, directory, sync, player, audio, github, clock, device, state: () => globalStore.getState() };
}
