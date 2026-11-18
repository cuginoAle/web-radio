import { getMetadata } from '@/db/queries/catalog';
import type { Db } from '@/db/types';
import type { StationSnapshot } from '@/services/audio/types';

/** GLOSSARY: Last station. Null when none was ever audible or the stored value can't be read. */
export async function getLastStation(db: Db): Promise<StationSnapshot | null> {
  try {
    return JSON.parse((await getMetadata(db, 'last_station')) ?? 'null');
  } catch {
    return null;
  }
}

export const setLastStation = (db: Db, station: StationSnapshot) =>
  db.runAsync('INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)', ['last_station', JSON.stringify(station)]);
