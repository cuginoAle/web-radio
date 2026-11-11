import { ACTIVE_GENERATION, toStationItem, type StationItem } from '@/db/queries/stations';
import type { Db } from '@/db/types';
import { pickStreamUrl } from '@/helpers/player/pickStreamUrl';
import { normalizeText } from '@/helpers/search/normalizeText';

/** A favorite joined to the active catalog; `inCatalog: false` = GLOSSARY: Preferito non in catalogo. */
export type FavoriteItem = StationItem & { inCatalog: boolean };

type Row = Omit<FavoriteItem, 'lastCheckOk' | 'inCatalog'> & { lastCheckOk: number; inCatalog: number };

export async function addFavorite(db: Db, station: StationItem) {
  await db.runAsync(
    `INSERT INTO favorites (uuid, added_at, name, url, favicon, country, sort_key) VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (uuid) DO NOTHING`,
    [
      station.uuid,
      new Date().toISOString(),
      station.name,
      pickStreamUrl(station) ?? station.url,
      station.favicon,
      station.country,
      normalizeText(station.name),
    ],
  );
}

export async function removeFavorite(db: Db, uuid: string) {
  await db.runAsync('DELETE FROM favorites WHERE uuid = ?', [uuid]);
}

export async function listFavoriteUuids(db: Db) {
  const rows = await db.getAllAsync<{ uuid: string }>('SELECT uuid FROM favorites', []);
  return rows.map((r) => r.uuid);
}

/** Alphabetical, uuid as tie-breaker; catalog data wins over the snapshot when the station still exists. */
export async function listFavorites(db: Db): Promise<FavoriteItem[]> {
  const rows = await db.getAllAsync<Row>(
    `SELECT f.uuid, COALESCE(s.name, f.name) AS name, COALESCE(s.url, f.url) AS url,
       COALESCE(s.url_resolved, '') AS urlResolved, COALESCE(s.favicon, f.favicon) AS favicon,
       COALESCE(s.country, f.country) AS country, s.first_tag AS firstTag,
       COALESCE(s.last_check_ok, 1) AS lastCheckOk, s.uuid IS NOT NULL AS inCatalog
     FROM favorites f
     LEFT JOIN stations s ON s.generation_id = ${ACTIVE_GENERATION} AND s.uuid = f.uuid
     ORDER BY COALESCE(s.search_key, f.sort_key), f.uuid`,
    [],
  );
  return rows.map(({ inCatalog, ...row }) => ({ ...toStationItem(row), inCatalog: inCatalog === 1 }));
}
