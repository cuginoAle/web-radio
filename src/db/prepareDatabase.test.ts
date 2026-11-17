import { prepareDatabase } from '@/db/prepareDatabase';
import { listStations } from '@/db/queries/stations';
import { rawStation } from '@test/fixtures/radioBrowserStation';
import { seedCatalog } from '@test/sqlite/seedCatalog';

// Turns a fresh database back into what a v2 install has on disk: a catalogue without popularity.
const UNDO_V3 = `
DROP INDEX stations_by_popularity;
ALTER TABLE stations DROP COLUMN click_count;
CREATE INDEX stations_by_name ON stations (generation_id, search_key, uuid);
PRAGMA user_version = 2;
`;

it('a catalogue downloaded before popularity existed stays browsable, alphabetical until the next refresh', async () => {
  const handle = await seedCatalog([
    rawStation({ stationuuid: 'b', name: 'Beta', clickcount: 90 }),
    rawStation({ stationuuid: 'a', name: 'Alfa', clickcount: 5 }),
  ]);
  await handle.db.execAsync(UNDO_V3);

  const db = handle.reopen();
  await prepareDatabase(db);

  expect((await listStations(db, {})).items.map((s) => s.uuid)).toEqual(['a', 'b']);
});
