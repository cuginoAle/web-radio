import { listFavorites, type FavoriteItem } from '@/db/queries/favorites';
import type { Db } from '@/db/types';

const TOP_FAVORITES = 6;

/** GLOSSARY: Ascolto cumulato. */
export async function addListeningTime(db: Db, uuid: string, seconds: number) {
  await db.runAsync(
    `INSERT INTO listening_time (uuid, seconds) VALUES (?, ?)
     ON CONFLICT (uuid) DO UPDATE SET seconds = seconds + excluded.seconds`,
    [uuid, seconds],
  );
}

/** GLOSSARY: Preferito più ascoltato. Ties keep the favorites' alphabetical order (stable sort). */
export async function listTopFavorites(db: Db): Promise<FavoriteItem[]> {
  const rows = await db.getAllAsync<{ uuid: string; seconds: number }>(
    'SELECT uuid, seconds FROM listening_time WHERE seconds > 0',
    [],
  );
  const seconds = new Map(rows.map((r) => [r.uuid, r.seconds]));
  return (await listFavorites(db))
    .filter((f) => seconds.has(f.uuid))
    .sort((a, b) => seconds.get(b.uuid)! - seconds.get(a.uuid)!)
    .slice(0, TOP_FAVORITES);
}
