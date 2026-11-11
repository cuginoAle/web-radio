import { prepareDatabase } from '@/db/prepareDatabase';
import { listFavorites, removeFavorite } from '@/db/queries/favorites';
import { seedDefaultFavorites } from '@/db/writes/seedDefaultFavorites';
import { createNodeDb } from '@test/sqlite/nodeDb';

const WBGO = '3487079b-91b1-4fb8-b315-c4150e705b7a';

async function freshInstall() {
  const { db } = createNodeDb();
  await prepareDatabase(db);
  await seedDefaultFavorites(db);
  return db;
}

it('a fresh install starts with the 22 preinstalled favorites', async () => {
  const db = await freshInstall();

  const favorites = await listFavorites(db);
  expect(favorites).toHaveLength(22);
  expect(favorites).toContainEqual(
    expect.objectContaining({
      uuid: WBGO,
      name: 'WBGO Jazz 88.3 FM',
      url: 'https://ais-sa8.cdnstream1.com/3629_128.mp3',
    }),
  );
});

it('every preinstalled favorite has a playable http(s) address', async () => {
  const db = await freshInstall();

  for (const { url } of await listFavorites(db)) expect(url).toMatch(/^https?:\/\/\S+$/);
});

it('a preinstalled favorite the user removed does not come back on the next start', async () => {
  const db = await freshInstall();
  await removeFavorite(db, WBGO);

  await seedDefaultFavorites(db);

  const uuids = (await listFavorites(db)).map((f) => f.uuid);
  expect(uuids).toHaveLength(21);
  expect(uuids).not.toContain(WBGO);
});
