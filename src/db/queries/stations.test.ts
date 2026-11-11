import { listStations, listStationUuids, listTags } from '@/db/queries/stations';
import { rawStation } from '@test/fixtures/radioBrowserStation';
import { seedCatalog } from '@test/sqlite/seedCatalog';

const station = (uuid: string, name: string, tags = '') => rawStation({ stationuuid: uuid, name, tags });
const names = (items: { name: string }[]) => items.map((s) => s.name);

it('lists the catalog alphabetically, ignoring case and accents, with uuid as tie-breaker', async () => {
  const { db } = await seedCatalog([
    station('u3', 'beta'),
    station('u2', 'Àlfa'),
    station('u1', 'alfa'),
    station('u4', 'Gamma'),
  ]);

  const page = await listStations(db, {});

  expect(page.items.map((s) => s.uuid)).toEqual(['u1', 'u2', 'u3', 'u4']);
  expect(page.next).toBeNull();
});

it('pages through the whole catalog with no overlap or gap, even across identical names', async () => {
  const { db } = await seedCatalog([
    station('u5', 'same'),
    station('u1', 'same'),
    station('u3', 'same'),
    station('u2', 'same'),
    station('u4', 'zeta'),
  ]);

  const first = await listStations(db, { limit: 2 });
  const second = await listStations(db, { limit: 2, after: first.next });
  const third = await listStations(db, { limit: 2, after: second.next });

  expect([first, second, third].flatMap((p) => p.items.map((s) => s.uuid))).toEqual(['u1', 'u2', 'u3', 'u5', 'u4']);
  expect(third.next).toBeNull();
});

describe('search by name', () => {
  const catalog = [
    station('u1', 'Café del Mar'),
    station('u2', 'RADIO CAFFÈ'),
    station('u3', 'Jazz 100%'),
    station('u4', 'Jazz 1000'),
    station('u5', 'rock_fm'),
    station('u6', 'rockXfm'),
    station('u7', 'back\\slash'),
  ];

  it.each([
    ['  CAFE ', ['Café del Mar']],
    ['caffe', ['RADIO CAFFÈ']],
    ['100%', ['Jazz 100%']],
    ['k_f', ['rock_fm']],
    ['k\\s', ['back\\slash']],
    ['%', ['Jazz 100%']],
    ['nothing like this', []],
  ])('%j finds the literal matches', async (query, expected) => {
    const { db } = await seedCatalog(catalog);
    expect(names((await listStations(db, { query })).items)).toEqual(expected);
  });

  it('treats a blank query as no search', async () => {
    const { db } = await seedCatalog(catalog);
    expect((await listStations(db, { query: '   ' })).items).toHaveLength(catalog.length);
  });
});

describe('tags', () => {
  const catalog = [
    station('u1', 'Alpha Jazz', 'Jazz,Soul'),
    station('u2', 'Beta Soul', 'soul'),
    station('u3', 'Gamma Jazz', 'jazz'),
    station('u4', 'Delta', ''),
  ];

  it('a station belongs to every group of its tags', async () => {
    const { db } = await seedCatalog(catalog);
    expect(names((await listStations(db, { tag: 'jazz' })).items)).toEqual(['Alpha Jazz', 'Gamma Jazz']);
    expect(names((await listStations(db, { tag: 'soul' })).items)).toEqual(['Alpha Jazz', 'Beta Soul']);
  });

  it('search and tag combine as an intersection', async () => {
    const { db } = await seedCatalog(catalog);
    expect(names((await listStations(db, { tag: 'soul', query: 'jazz' })).items)).toEqual(['Alpha Jazz']);
  });

  it('stations without tags stay in the general list', async () => {
    const { db } = await seedCatalog(catalog);
    expect(names((await listStations(db, {})).items)).toContain('Delta');
  });
});

it('lists tag groups by number of stations, then by name, with an optional limit', async () => {
  const { db } = await seedCatalog([
    station('u1', 'A', 'Rock,Pop'),
    station('u2', 'B', 'rock'),
    station('u3', 'C', 'Jazz'),
    station('u4', 'D', 'Rock,Blues'),
  ]);

  expect(await listTags(db)).toEqual([
    { key: 'rock', label: expect.stringMatching(/^rock$/i), count: 3 },
    { key: 'blues', label: 'Blues', count: 1 },
    { key: 'jazz', label: 'Jazz', count: 1 },
    { key: 'pop', label: 'Pop', count: 1 },
  ]);
  expect((await listTags(db, 2)).map((t) => t.key)).toEqual(['rock', 'blues']);
});

it('returns every uuid of a filtered list in display order, beyond one page', async () => {
  const stations = Array.from({ length: 120 }, (_, i) => station(`u${i}`, `Radio ${String(i).padStart(3, '0')}`, 'jazz'));
  const { db } = await seedCatalog([...stations, station('other', 'Radio 000 bis', 'rock')]);

  const uuids = await listStationUuids(db, { tag: 'jazz' });

  expect(uuids).toHaveLength(120);
  expect(uuids.slice(0, 2)).toEqual(['u0', 'u1']);
  expect(uuids).not.toContain('other');
});
