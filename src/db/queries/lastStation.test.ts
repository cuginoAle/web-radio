import { prepareDatabase } from '@/db/prepareDatabase';
import { getLastStation, setLastStation } from '@/db/queries/lastStation';
import type { StationSnapshot } from '@/services/audio/types';
import { createNodeDb } from '@test/sqlite/nodeDb';

const A: StationSnapshot = {
  uuid: 'a',
  name: 'Radio A',
  streamUrl: 'https://stream.example/a',
  favicon: null,
  subtitle: '128 kbps · jazz · Italy',
};

async function setup() {
  const { db } = createNodeDb();
  await prepareDatabase(db);
  return db;
}

describe('Last station', () => {
  it('is none until a station has played', async () => {
    expect(await getLastStation(await setup())).toBeNull();
  });

  it('keeps the latest station stored', async () => {
    const db = await setup();
    await setLastStation(db, A);
    await setLastStation(db, { ...A, uuid: 'b', name: 'Radio B' });
    expect(await getLastStation(db)).toEqual({ ...A, uuid: 'b', name: 'Radio B' });
  });

  it('is none when the stored value is unreadable', async () => {
    const db = await setup();
    await db.runAsync("INSERT INTO app_metadata (key, value) VALUES ('last_station', '{oops')", []);
    expect(await getLastStation(db)).toBeNull();
  });
});
