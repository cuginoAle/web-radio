import type { CatalogStation } from '@/helpers/catalog/types';
import type { Db, SqlValue } from '@/db/types';

const STATION_ROWS_PER_INSERT = 100; // 17 columns: well below SQLite's bound-parameter limit
const TAG_ROWS_PER_INSERT = 400;

const chunks = <T>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size));

async function insertRows(txn: Db, table: string, columns: string[], rows: SqlValue[][], perInsert: number) {
  const tuple = `(${columns.map(() => '?').join(', ')})`;
  for (const chunk of chunks(rows, perInsert)) {
    await txn.runAsync(
      `INSERT OR IGNORE INTO ${table} (${columns.join(', ')}) VALUES ${chunk.map(() => tuple).join(', ')}`,
      chunk.flat(),
    );
  }
}

export async function createStagingGeneration(db: Db, mirror: string) {
  const result = await db.runAsync(
    "INSERT INTO catalog_generations (status, started_at, mirror) VALUES ('staging', ?, ?)",
    [new Date().toISOString(), mirror],
  );
  return result.lastInsertRowId;
}

/** Writes one page; duplicates of a uuid already in the generation are ignored. */
export async function writeStations(txn: Db, generationId: number, stations: CatalogStation[]) {
  await txn.execAsync('PRAGMA busy_timeout = 5000'); // expo-sqlite opens transactions on a fresh connection
  const stationRows = stations.map((s) => [
    generationId, s.uuid, s.name, s.searchKey, s.url, s.urlResolved, s.favicon, s.country, s.countryCode,
    s.languages, s.codec, s.bitrate, s.hls ? 1 : 0, s.lastCheckOk ? 1 : 0, s.lastCheckTime, s.tags[0]?.label ?? null,
    s.clickCount,
  ]);
  await insertRows(
    txn,
    'stations',
    ['generation_id', 'uuid', 'name', 'search_key', 'url', 'url_resolved', 'favicon', 'country', 'country_code',
      'languages', 'codec', 'bitrate', 'hls', 'last_check_ok', 'last_check_time', 'first_tag', 'click_count'],
    stationRows,
    STATION_ROWS_PER_INSERT,
  );
  const tagRows = stations.flatMap((s) => s.tags.map((t) => [generationId, t.key, s.uuid, t.label]));
  await insertRows(txn, 'station_tags', ['generation_id', 'tag_key', 'uuid', 'tag_label'], tagRows, TAG_ROWS_PER_INSERT);
}

export async function countStations(db: Db, generationId: number) {
  const row = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM stations WHERE generation_id = ?', [
    generationId,
  ]);
  return row?.n ?? 0;
}

/** Atomically makes the generation the catalog. */
export async function activateGeneration(db: Db, generationId: number, mirror: string, count: number) {
  const now = new Date().toISOString();
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.execAsync('PRAGMA busy_timeout = 5000');
    await txn.runAsync("UPDATE catalog_generations SET status = 'ready', finished_at = ?, station_count = ? WHERE id = ?", [
      now, count, generationId,
    ]);
    await txn.runAsync(
      `INSERT OR REPLACE INTO app_metadata (key, value) VALUES
        ('active_generation', ?), ('active_count', ?), ('last_success_at', ?), ('last_mirror', ?)`,
      [String(generationId), String(count), now, mirror],
    );
    // Refresh snapshots of favorites that still exist; never creates or deletes a favorite.
    await txn.runAsync(
      `UPDATE favorites SET name = s.name, sort_key = s.search_key, favicon = s.favicon, country = s.country,
         url = CASE WHEN s.url_resolved LIKE 'http%' THEN s.url_resolved ELSE s.url END
       FROM stations s WHERE s.generation_id = ? AND s.uuid = favorites.uuid`,
      [generationId],
    );
  });
}

export async function deleteGeneration(db: Db, generationId: number) {
  await db.execAsync(`DELETE FROM station_tags WHERE generation_id = ${Number(generationId)};
    DELETE FROM stations WHERE generation_id = ${Number(generationId)};
    DELETE FROM catalog_generations WHERE id = ${Number(generationId)};`);
}

/** Removes stale staging and superseded generations; the active one is never touched. */
export async function deleteInactiveGenerations(db: Db) {
  const active = "IFNULL((SELECT CAST(value AS INTEGER) FROM app_metadata WHERE key = 'active_generation'), -1)";
  await db.execAsync(`DELETE FROM station_tags WHERE generation_id != ${active};
    DELETE FROM stations WHERE generation_id != ${active};
    DELETE FROM catalog_generations WHERE id != ${active};`);
}
