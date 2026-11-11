import { prepareDatabase } from '@/db/prepareDatabase';
import { getCatalogStatus } from '@/db/queries/catalog';
import { addFavorite, listFavorites, removeFavorite } from '@/db/queries/favorites';
import { getStation } from '@/db/queries/stations';
import { createCatalogSync } from '@/services/catalog-sync/createCatalogSync';
import { createFakeDirectory, rawStations } from '@test/fakes/fakeDirectory';
import { createNodeDb } from '@test/sqlite/nodeDb';

async function setup(mirrors: Parameters<typeof createFakeDirectory>[0]) {
  const handle = createNodeDb();
  await prepareDatabase(handle.db);
  const directory = createFakeDirectory(mirrors);
  const sync = createCatalogSync({ db: handle.db, client: directory.client });
  return { ...handle, directory, sync };
}

it('a first download activates a catalog with every station received, reporting real progress', async () => {
  const { db, sync } = await setup({ m1: rawStations(2500, 'a') });
  const progress: number[] = [];

  await sync.refresh((imported) => progress.push(imported));

  expect(progress).toEqual([1000, 2000, 2500]);
  expect(await getCatalogStatus(db)).toEqual({
    generationId: expect.any(Number),
    stationCount: 2500,
    lastSuccessAt: expect.stringMatching(/^\d{4}-\d\d-\d\dT/),
  });
  expect(await getStation(db, 'a-1234')).toMatchObject({ uuid: 'a-1234', name: 'Radio a1234' });
});

it.each([
  ['the connection drops on page 2', (offset: number) => (offset >= 1000 ? Promise.reject(new TypeError('offline')) : undefined)],
  ['page 2 has a station without uuid', (offset: number) => (offset >= 1000 ? [{ name: 'no id' }] : undefined)],
  ['the directory answers an empty list', () => []],
])('keeps the previous catalog when %s', async (_case, failPage) => {
  const { db, sync, directory } = await setup({ m1: rawStations(1500, 'old') });
  await sync.refresh();
  const before = await getCatalogStatus(db);

  directory.setMirror('m1', rawStations(2500, 'new'));
  directory.beforePage((_mirror, offset) => failPage(offset));
  await expect(sync.refresh()).rejects.toThrow();

  expect(await getCatalogStatus(db)).toEqual(before);
  expect(await getStation(db, 'old-1')).not.toBeNull();
  expect(await getStation(db, 'new-1')).toBeNull();
});

const untilAborted = (signal?: AbortSignal) =>
  new Promise((_, reject) => signal?.addEventListener('abort', () => reject(new Error('aborted'))));

it('cancelling stops the download and keeps the previous catalog and success date', async () => {
  const { db, sync, directory } = await setup({ m1: rawStations(1500, 'old') });
  await sync.refresh();
  const before = await getCatalogStatus(db);

  directory.setMirror('m1', rawStations(2500, 'new'));
  directory.beforePage((_mirror, offset, signal) => (offset >= 1000 ? untilAborted(signal) : undefined));
  const refreshing = sync.refresh();
  await new Promise((r) => setTimeout(r, 20)); // let page 1 land
  sync.cancel();

  await expect(refreshing).rejects.toThrow();
  expect(await getCatalogStatus(db)).toEqual(before);
  expect(await getStation(db, 'new-1')).toBeNull();
});

it('a second refresh request joins the one already running instead of starting another', async () => {
  const { sync, directory } = await setup({ m1: rawStations(1500) });

  await Promise.all([sync.refresh(), sync.refresh()]);

  expect(directory.pages).toEqual([
    { mirror: 'm1', offset: 0 },
    { mirror: 'm1', offset: 1000 },
  ]);
});

it('switching mirror restarts from the first page in a clean staging', async () => {
  const { db, sync, directory } = await setup({ m1: rawStations(2500, 'one'), m2: rawStations(1200, 'two') });
  directory.beforePage((mirror, offset) =>
    mirror === 'm1' && offset >= 1000 ? Promise.reject(new TypeError('m1 went down')) : undefined,
  );

  await sync.refresh();

  expect(directory.pages).toEqual([
    { mirror: 'm1', offset: 0 },
    { mirror: 'm1', offset: 1000 },
    { mirror: 'm2', offset: 0 },
    { mirror: 'm2', offset: 1000 },
  ]);
  expect((await getCatalogStatus(db)).stationCount).toBe(1200);
  expect(await getStation(db, 'one-1')).toBeNull();
});

it('tries at most three mirrors, then reports the error', async () => {
  const down = new TypeError('down');
  const { db, sync, directory } = await setup({ m1: down, m2: down, m3: down, m4: rawStations(10) });

  await expect(sync.refresh()).rejects.toThrow('down');

  expect(directory.pages.map((p) => p.mirror)).toEqual(['m1', 'm2', 'm3']);
  expect((await getCatalogStatus(db)).generationId).toBeNull();
});

it('a station repeated across pages is stored once', async () => {
  const list = rawStations(1500);
  list.splice(1000, 0, list[999]); // the directory shifted while paging: s-999 shows up again on page 2
  const { db, sync } = await setup({ m1: list });
  const progress: number[] = [];

  await sync.refresh((n) => progress.push(n));

  expect(progress).toEqual([1000, 1500]);
  expect((await getCatalogStatus(db)).stationCount).toBe(1500);
});

it('stops with an error when the directory keeps sending the same page', async () => {
  const { db, sync, directory } = await setup({ m1: rawStations(1000) });
  directory.beforePage(() => rawStations(1000)); // offset ignored: always page one

  await expect(sync.refresh()).rejects.toThrow();

  expect(directory.pages.length).toBeLessThan(10);
  expect((await getCatalogStatus(db)).generationId).toBeNull();
});

it('after a crash during the download, the next start still has the previous catalog', async () => {
  const handle = await setup({ m1: rawStations(1500, 'old') });
  await handle.sync.refresh();
  const before = await getCatalogStatus(handle.db);

  handle.directory.setMirror('m1', rawStations(2500, 'new'));
  handle.directory.beforePage((_m, offset) => (offset >= 1000 ? new Promise(() => {}) : undefined)); // process dies
  void handle.sync.refresh();
  await new Promise((r) => setTimeout(r, 20));

  const db = handle.reopen();
  await prepareDatabase(db);
  expect(await getCatalogStatus(db)).toEqual(before);
  expect(await getStation(db, 'new-1')).toBeNull();

  const directory = createFakeDirectory({ m1: rawStations(2500, 'new') });
  await createCatalogSync({ db, client: directory.client }).refresh();
  expect((await getCatalogStatus(db)).stationCount).toBe(2500);
});

it('a cleanup failure after the switch keeps the new catalog and still counts as success', async () => {
  const handle = await setup({ m1: rawStations(1500, 'old') });
  await handle.sync.refresh();
  const failingCleanup = {
    ...handle.db,
    execAsync: (sql: string) =>
      sql.includes('generation_id !=') ? Promise.reject(new Error('killed')) : handle.db.execAsync(sql),
  };
  const directory = createFakeDirectory({ m1: rawStations(1200, 'new') });

  await createCatalogSync({ db: failingCleanup, client: directory.client }).refresh();

  const db = handle.reopen();
  await prepareDatabase(db);
  expect((await getCatalogStatus(db)).stationCount).toBe(1200);
  expect(await getStation(db, 'new-1')).not.toBeNull();
  expect(await getStation(db, 'old-1')).toBeNull();
});

const favoriteOf = async (db: Awaited<ReturnType<typeof setup>>['db'], uuid: string) => {
  const station = await getStation(db, uuid);
  if (!station) throw new Error(`no station ${uuid}`);
  await addFavorite(db, station);
};

it('a refresh keeps favorites: updated from the new catalog, or kept with their last snapshot when gone', async () => {
  const { db, sync, directory } = await setup({ m1: rawStations(3, 'x') });
  await sync.refresh();
  await favoriteOf(db, 'x-0');
  await favoriteOf(db, 'x-1');

  directory.setMirror('m1', [rawStations(1, 'x', { name: 'Radio rinominata' })[0], rawStations(3, 'x')[2]]);
  await sync.refresh();

  expect(await listFavorites(db)).toEqual([
    expect.objectContaining({ uuid: 'x-0', name: 'Radio rinominata', inCatalog: true }),
    expect.objectContaining({ uuid: 'x-1', name: 'Radio x1', inCatalog: false }),
  ]);
});

it('favorites changed while downloading stay as the user left them', async () => {
  const { db, sync, directory } = await setup({ m1: rawStations(3, 'x') });
  await sync.refresh();
  await favoriteOf(db, 'x-0');

  directory.setMirror('m1', rawStations(1500, 'x'));
  directory.beforePage(async (_m, offset) => {
    if (offset !== 1000) return;
    await removeFavorite(db, 'x-0');
    await favoriteOf(db, 'x-2');
  });
  await sync.refresh();

  expect((await listFavorites(db)).map((f) => f.uuid)).toEqual(['x-2']);
});
