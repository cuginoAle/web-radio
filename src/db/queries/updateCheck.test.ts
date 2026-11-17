import { prepareDatabase } from '@/db/prepareDatabase';
import { isUpdateCheckEnabled, setUpdateCheckEnabled } from '@/db/queries/updateCheck';
import { createNodeDb } from '@test/sqlite/nodeDb';

async function setup() {
  const { db } = createNodeDb();
  await prepareDatabase(db);
  return db;
}

describe('Update check setting', () => {
  it('is off when nothing was ever stored', async () => {
    expect(await isUpdateCheckEnabled(await setup())).toBe(false);
  });

  it('persists on, then off again', async () => {
    const db = await setup();
    await setUpdateCheckEnabled(db, true);
    expect(await isUpdateCheckEnabled(db)).toBe(true);
    await setUpdateCheckEnabled(db, false);
    expect(await isUpdateCheckEnabled(db)).toBe(false);
  });
});
