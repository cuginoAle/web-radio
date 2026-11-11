import { getCatalogStatus } from '@/db/queries/catalog';
import { listFavoriteUuids } from '@/db/queries/favorites';
import { getRuntime } from '@/services/runtime';
import { globalStore } from '@/state/global-state';

/** Publishes what SQLite holds to the in-memory store. */
export async function loadCatalogState() {
  const { db } = getRuntime();
  const [status, favorites] = await Promise.all([getCatalogStatus(db), listFavoriteUuids(db)]);
  globalStore.getState().setCatalog(status);
  globalStore.getState().setFavoriteUuids(favorites);
}
