import { addFavorite, listFavorites, listFavoriteUuids, removeFavorite } from '@/db/queries/favorites';
import { getStation } from '@/db/queries/stations';
import { prepareDatabase } from '@/db/prepareDatabase';
import { rawStation } from '@test/fixtures/radioBrowserStation';
import { seedCatalog } from '@test/sqlite/seedCatalog';

const station = (uuid: string, name: string) => rawStation({ stationuuid: uuid, name });

async function favoritesOf(names: [string, string][]) {
  const handle = await seedCatalog(names.map(([uuid, name]) => station(uuid, name)));
  const add = async (uuid: string) => addFavorite(handle.db, (await getStation(handle.db, uuid))!);
  return { ...handle, add };
}

it('lists favorites alphabetically, ignoring case and accents', async () => {
  const { db, add } = await favoritesOf([['z', 'zeta'], ['e', 'Èta'], ['a', 'ALFA']]);
  await add('z');
  await add('e');
  await add('a');

  expect((await listFavorites(db)).map((f) => f.name)).toEqual(['ALFA', 'Èta', 'zeta']);
});

it('adding twice keeps one favorite, removing deletes it', async () => {
  const { db, add } = await favoritesOf([['a', 'Alfa'], ['b', 'Beta']]);
  await add('a');
  await add('a');
  await add('b');
  await removeFavorite(db, 'b');

  expect(await listFavoriteUuids(db)).toEqual(['a']);
});

it('favorites survive an app restart and stay usable offline', async () => {
  const handle = await favoritesOf([['a', 'Alfa']]);
  await handle.add('a');

  const db = handle.reopen();
  await prepareDatabase(db);

  expect(await listFavorites(db)).toEqual([expect.objectContaining({ uuid: 'a', name: 'Alfa', inCatalog: true })]);
});
