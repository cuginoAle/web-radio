import type { Db } from '@/db/types';

// Catalog generations and user data live in separate tables: a refresh never touches favorites rows it did not find.
const V1 = `
CREATE TABLE catalog_generations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  status TEXT NOT NULL CHECK (status IN ('staging', 'ready')),
  started_at TEXT NOT NULL,
  finished_at TEXT,
  mirror TEXT NOT NULL,
  station_count INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE stations (
  generation_id INTEGER NOT NULL,
  uuid TEXT NOT NULL,
  name TEXT NOT NULL,
  search_key TEXT NOT NULL,
  url TEXT NOT NULL,
  url_resolved TEXT NOT NULL,
  favicon TEXT,
  country TEXT NOT NULL,
  country_code TEXT NOT NULL,
  languages TEXT NOT NULL,
  codec TEXT NOT NULL,
  bitrate INTEGER NOT NULL,
  hls INTEGER NOT NULL,
  last_check_ok INTEGER NOT NULL,
  last_check_time TEXT,
  first_tag TEXT,
  PRIMARY KEY (generation_id, uuid)
) WITHOUT ROWID;
CREATE INDEX stations_by_name ON stations (generation_id, search_key, uuid);
CREATE TABLE station_tags (
  generation_id INTEGER NOT NULL,
  tag_key TEXT NOT NULL,
  uuid TEXT NOT NULL,
  tag_label TEXT NOT NULL,
  PRIMARY KEY (generation_id, tag_key, uuid)
) WITHOUT ROWID;
CREATE INDEX station_tags_by_station ON station_tags (generation_id, uuid);
CREATE TABLE favorites (
  uuid TEXT PRIMARY KEY NOT NULL,
  added_at TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  favicon TEXT,
  country TEXT NOT NULL,
  sort_key TEXT NOT NULL
);
CREATE TABLE app_metadata (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT
);
`;

const MIGRATIONS = [V1];

/** Brings the schema to the latest version (PRAGMA user_version). */
export async function migrate(db: Db) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
  const from = row?.user_version ?? 0;
  for (let version = from; version < MIGRATIONS.length; version++) {
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.execAsync(MIGRATIONS[version]);
      await txn.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
}
