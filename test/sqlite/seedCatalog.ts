import { prepareDatabase } from '@/db/prepareDatabase';
import { createCatalogSync } from '@/services/catalog-sync/createCatalogSync';
import { createFakeDirectory } from '@test/fakes/fakeDirectory';
import type { RawStation } from '@test/fixtures/radioBrowserStation';
import { createNodeDb } from '@test/sqlite/nodeDb';

/** A real SQLite database whose active catalog is exactly `stations`, loaded through a refresh. */
export async function seedCatalog(stations: RawStation[]) {
  const handle = createNodeDb();
  await prepareDatabase(handle.db);
  const directory = createFakeDirectory({ mirror: stations });
  const sync = createCatalogSync({ db: handle.db, client: directory.client });
  await sync.refresh();
  return { ...handle, directory, sync };
}
