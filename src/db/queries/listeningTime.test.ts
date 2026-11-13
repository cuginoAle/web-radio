import { addFavorite, removeFavorite } from '@/db/queries/favorites';
import { addListeningTime, listTopFavorites } from '@/db/queries/listeningTime';
import { getStation } from '@/db/queries/stations';
import { prepareDatabase } from '@/db/prepareDatabase';
import { rawStation } from '@test/fixtures/radioBrowserStation';
import { seedCatalog } from '@test/sqlite/seedCatalog';

const names: [string, string][] = [['a', 'Alfa'], ['b', 'Beta'], ['c', 'Gamma'], ['d', 'Delta'], ['e', 'Epsilon'], ['f', 'Zeta'], ['g', 'Eta']];

async function setup() {
  const handle = await seedCatalog(names.map(([uuid, name]) => rawStation({ stationuuid: uuid, name })));
  const add = async (...uuids: string[]) => {
    for (const uuid of uuids) await addFavorite(handle.db, (await getStation(handle.db, uuid))!);
  };
  const top = async () => (await listTopFavorites(handle.db)).map((f) => f.name);
  return { ...handle, add, top };
}

it('ranks at most six favorites by listening time, most listened first', async () => {
  const { db, add, top } = await setup();
  await add('a', 'b', 'c', 'd', 'e', 'f', 'g');
  await addListeningTime(db, 'a', 10);
  await addListeningTime(db, 'b', 70);
  await addListeningTime(db, 'c', 60);
  await addListeningTime(db, 'd', 20);
  await addListeningTime(db, 'e', 50);
  await addListeningTime(db, 'f', 40);
  await addListeningTime(db, 'g', 5);
  await addListeningTime(db, 'a', 15); // accumulates: 25

  expect(await top()).toEqual(['Beta', 'Gamma', 'Epsilon', 'Zeta', 'Alfa', 'Delta']);
});

it('leaves out favorites never listened to and stations that are not favorites', async () => {
  const { db, add, top } = await setup();
  await add('a', 'b');
  await addListeningTime(db, 'e', 500);
  await addListeningTime(db, 'b', 5);

  expect(await top()).toEqual(['Beta']);
});

it('counts time listened before the station became a favorite, and keeps it after removal', async () => {
  const { db, add, top } = await setup();
  await addListeningTime(db, 'a', 60);
  await add('a');
  expect(await top()).toEqual(['Alfa']);

  await removeFavorite(db, 'a');
  expect(await top()).toEqual([]);
  await add('a');
  expect(await top()).toEqual(['Alfa']);
});

it('breaks ties by name', async () => {
  const { db, add, top } = await setup();
  await add('c', 'a');
  await addListeningTime(db, 'c', 7);
  await addListeningTime(db, 'a', 7);

  expect(await top()).toEqual(['Alfa', 'Gamma']);
});

it('keeps a favorite that left the catalog, and the time survives a restart', async () => {
  const handle = await setup();
  await handle.add('a');
  await addListeningTime(handle.db, 'a', 12);
  handle.directory.setMirror('mirror', [rawStation({ stationuuid: 'z', name: 'Zeta' })]);
  await handle.sync.refresh();

  const db = handle.reopen();
  await prepareDatabase(db);

  expect(await listTopFavorites(db)).toEqual([expect.objectContaining({ uuid: 'a', name: 'Alfa', inCatalog: false })]);
});
