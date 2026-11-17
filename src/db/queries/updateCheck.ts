import { getMetadata, type MetadataKey } from '@/db/queries/catalog';
import type { Db } from '@/db/types';
import type { AvailableUpdate } from '@/helpers/updates/pickUpdate';

const put = (db: Db, key: MetadataKey, value: string) =>
  db.runAsync('INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)', [key, value]);

/** GLOSSARY: Update check. Off until the user says yes: a missing key means off. */
export async function isUpdateCheckEnabled(db: Db) {
  return (await getMetadata(db, 'update_check_enabled')) === '1';
}

export async function setUpdateCheckEnabled(db: Db, enabled: boolean) {
  await put(db, 'update_check_enabled', enabled ? '1' : '0');
}

/** Milliseconds since the epoch; 0 when never. */
const getTime = async (db: Db, key: MetadataKey) => Number(await getMetadata(db, key)) || 0;

export const getLastCheckAt = (db: Db) => getTime(db, 'update_last_check_at');
export const setLastCheckAt = (db: Db, at: number) => put(db, 'update_last_check_at', String(at));

export const getSnoozedUntil = (db: Db) => getTime(db, 'update_snoozed_until');
export const setSnoozedUntil = (db: Db, at: number) => put(db, 'update_snoozed_until', String(at));

export async function getStoredUpdate(db: Db): Promise<AvailableUpdate | null> {
  const [version, url] = await Promise.all([getMetadata(db, 'update_version'), getMetadata(db, 'update_apk_url')]);
  return version && url ? { version, url } : null;
}

export async function storeUpdate(db: Db, update: AvailableUpdate) {
  await put(db, 'update_version', update.version);
  await put(db, 'update_apk_url', update.url);
}
