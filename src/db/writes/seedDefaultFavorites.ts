import { getMetadata } from '@/db/queries/catalog';
import { addFavorite } from '@/db/queries/favorites';
import type { Db } from '@/db/types';
import { DEFAULT_FAVORITES } from '@/db/writes/defaultFavorites';

/** Once per install: a favorite the user later removes must stay removed. */
export async function seedDefaultFavorites(db: Db) {
  if (await getMetadata(db, 'favorites_seeded')) return;
  await db.withExclusiveTransactionAsync(async (txn) => {
    for (const station of DEFAULT_FAVORITES) await addFavorite(txn, station);
    await txn.runAsync("INSERT INTO app_metadata (key, value) VALUES ('favorites_seeded', '1')", []);
  });
}
