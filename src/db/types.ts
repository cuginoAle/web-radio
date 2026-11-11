export type SqlValue = string | number | null;

/** The subset of expo-sqlite's SQLiteDatabase the app uses (also implemented over node:sqlite in tests). */
export interface Db {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params: SqlValue[]): Promise<{ changes: number; lastInsertRowId: number }>;
  getAllAsync<T>(sql: string, params: SqlValue[]): Promise<T[]>;
  getFirstAsync<T>(sql: string, params: SqlValue[]): Promise<T | null>;
  /** Runs on a separate connection: queries outside `task` never join (or roll back with) this transaction. */
  withExclusiveTransactionAsync(task: (txn: Db) => Promise<void>): Promise<void>;
}
