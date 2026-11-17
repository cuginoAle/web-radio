import { getMetadata } from '@/db/queries/catalog';
import type { Db } from '@/db/types';

/** GLOSSARY: Update check. Off until the user says yes: a missing key means off. */
export async function isUpdateCheckEnabled(db: Db) {
  return (await getMetadata(db, 'update_check_enabled')) === '1';
}

export async function setUpdateCheckEnabled(db: Db, enabled: boolean) {
  await db.runAsync("INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('update_check_enabled', ?)", [enabled ? '1' : '0']);
}
