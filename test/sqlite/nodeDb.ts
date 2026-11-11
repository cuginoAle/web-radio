import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import type { Db, SqlValue } from '@/db/types';

const wrap = (conn: DatabaseSync, file: string): Db => {
  const db: Db = {
    async execAsync(sql) {
      conn.exec(sql);
    },
    async runAsync(sql, params: SqlValue[]) {
      const result = conn.prepare(sql).run(...params);
      return { changes: Number(result.changes), lastInsertRowId: Number(result.lastInsertRowid) };
    },
    async getAllAsync<T>(sql: string, params: SqlValue[]) {
      return conn.prepare(sql).all(...params) as T[];
    },
    async getFirstAsync<T>(sql: string, params: SqlValue[]) {
      return (conn.prepare(sql).get(...params) ?? null) as T | null;
    },
    // Mirrors expo-sqlite: a fresh connection with a plain BEGIN.
    async withExclusiveTransactionAsync(task) {
      const txnConn = new DatabaseSync(file);
      try {
        txnConn.exec('BEGIN');
        await task(wrap(txnConn, file));
        txnConn.exec('COMMIT');
      } catch (error) {
        if (txnConn.isTransaction) txnConn.exec('ROLLBACK');
        throw error;
      } finally {
        txnConn.close();
      }
    },
  };
  return db;
};

/** A file-backed SQLite database; `reopen()` simulates an app restart on the same file. */
export function createNodeDb() {
  const file = join(mkdtempSync(join(tmpdir(), 'radio-db-')), 'radio.db');
  let conn = new DatabaseSync(file);
  const handle = {
    db: wrap(conn, file),
    reopen() {
      conn.close();
      conn = new DatabaseSync(file);
      handle.db = wrap(conn, file);
      return handle.db;
    },
  };
  return handle;
}
