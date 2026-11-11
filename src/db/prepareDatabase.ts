import { migrate } from '@/db/migrations';
import { deleteInactiveGenerations } from '@/db/writes/generations';
import type { Db } from '@/db/types';

/** Run once per app start: schema, then cleanup of generations abandoned by a crash or a refresh. */
export async function prepareDatabase(db: Db) {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
  await migrate(db);
  await deleteInactiveGenerations(db);
}
