import type { Db, SqlValue } from '@/db/types';
import { escapeLike } from '@/helpers/search/escapeLike';
import { normalizeText } from '@/helpers/search/normalizeText';

/** A station of the active catalog, as lists and the player need it. */
export type StationItem = {
  uuid: string;
  name: string;
  url: string;
  urlResolved: string;
  favicon: string | null;
  country: string;
  firstTag: string | null;
  lastCheckOk: boolean;
};

type Row = Omit<StationItem, 'lastCheckOk'> & { lastCheckOk: number };

export const STATION_COLUMNS = `s.uuid, s.name, s.url, s.url_resolved AS urlResolved, s.favicon, s.country,
  s.first_tag AS firstTag, s.last_check_ok AS lastCheckOk`;

export const ACTIVE_GENERATION = "(SELECT CAST(value AS INTEGER) FROM app_metadata WHERE key = 'active_generation')";

export const toStationItem = ({ lastCheckOk, ...row }: Row): StationItem => ({ ...row, lastCheckOk: lastCheckOk === 1 });

export async function getStation(db: Db, uuid: string): Promise<StationItem | null> {
  const row = await db.getFirstAsync<Row>(
    `SELECT ${STATION_COLUMNS} FROM stations s WHERE s.generation_id = ${ACTIVE_GENERATION} AND s.uuid = ?`,
    [uuid],
  );
  return row && toStationItem(row);
}

export type StationFilter = { query?: string; tag?: string | null };
export type StationCursor = { key: string; uuid: string };

const PAGE_SIZE = 50;

const filterClause = ({ query, tag }: StationFilter) => {
  const clauses = [`s.generation_id = ${ACTIVE_GENERATION}`];
  const params: SqlValue[] = [];
  const needle = normalizeText(query ?? '');
  if (needle) {
    clauses.push("s.search_key LIKE ? ESCAPE '\\'");
    params.push(`%${escapeLike(needle)}%`);
  }
  if (tag) {
    clauses.push('EXISTS (SELECT 1 FROM station_tags t WHERE t.generation_id = s.generation_id AND t.tag_key = ? AND t.uuid = s.uuid)');
    params.push(tag);
  }
  return { where: clauses.join(' AND '), params };
};

/** One page of the active catalog in stable alphabetical order (keyset paging). */
export async function listStations(
  db: Db,
  { after = null, limit = PAGE_SIZE, ...filter }: StationFilter & { after?: StationCursor | null; limit?: number },
) {
  const { where, params } = filterClause(filter);
  const rows = await db.getAllAsync<Row & { sortKey: string }>(
    `SELECT ${STATION_COLUMNS}, s.search_key AS sortKey FROM stations s
     WHERE ${where} ${after ? 'AND (s.search_key, s.uuid) > (?, ?)' : ''}
     ORDER BY s.search_key, s.uuid LIMIT ?`,
    [...params, ...(after ? [after.key, after.uuid] : []), limit + 1],
  );
  const pageRows = rows.slice(0, limit);
  const last = pageRows[pageRows.length - 1];
  return {
    items: pageRows.map(({ sortKey: _sortKey, ...row }) => toStationItem(row)),
    next: rows.length > limit ? { key: last.sortKey, uuid: last.uuid } : null,
  };
}

/** All uuids of a list, frozen when listening starts (GLOSSARY: Source list). */
export async function listStationUuids(db: Db, filter: StationFilter) {
  const { where, params } = filterClause(filter);
  const rows = await db.getAllAsync<{ uuid: string }>(
    `SELECT s.uuid FROM stations s WHERE ${where} ORDER BY s.search_key, s.uuid`,
    params,
  );
  return rows.map((r) => r.uuid);
}

export type TagGroup = { key: string; label: string; count: number };

/** Tag groups of the active catalog, largest first. */
export async function listTags(db: Db, limit = -1) {
  return db.getAllAsync<TagGroup>(
    `SELECT t.tag_key AS key, MIN(t.tag_label) AS label, COUNT(*) AS count FROM station_tags t
     WHERE t.generation_id = ${ACTIVE_GENERATION}
     GROUP BY t.tag_key ORDER BY count DESC, t.tag_key LIMIT ?`,
    [limit],
  );
}
