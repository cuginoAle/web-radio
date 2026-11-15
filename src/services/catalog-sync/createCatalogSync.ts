import { getMetadata } from '@/db/queries/catalog';
import type { Db } from '@/db/types';
import {
  activateGeneration,
  countStations,
  createStagingGeneration,
  deleteGeneration,
  deleteInactiveGenerations,
  writeStations,
} from '@/db/writes/generations';
import { normalizeStationPage } from '@/helpers/catalog/normalizeStationPage';
import type { RadioBrowserClient } from '@/services/radio-browser/createRadioBrowserClient';
import { DirectoryError } from '@/services/radio-browser/DirectoryError';

const PAGE_SIZE = 1_000;
const MAX_MIRRORS = 3;
const NO_PROGRESS = 'The directory keeps sending the same stations. Try again later.';
const EMPTY_CATALOG = 'The directory returned no stations.';

type Progress = (imported: number) => void;

type Deps = {
  db: Db;
  client: RadioBrowserClient;
};

export function createCatalogSync({ db, client }: Deps) {
  let running: Promise<void> | null = null;
  let controller: AbortController | null = null;

  const importFrom = async (mirror: string, generationId: number, onProgress: Progress, signal: AbortSignal) => {
    let offset = 0;
    let imported = 0;
    for (;;) {
      const page = normalizeStationPage(await client.fetchStationsPage(mirror, offset, PAGE_SIZE, signal));
      signal.throwIfAborted();
      if (!page.ok) throw new DirectoryError('invalid', page.error);
      await db.withExclusiveTransactionAsync((txn) => writeStations(txn, generationId, page.stations));
      const total = await countStations(db, generationId);
      // A full page that adds nothing means the directory is repeating itself: stop instead of looping forever.
      if (page.stations.length === PAGE_SIZE && total === imported) throw new DirectoryError('invalid', NO_PROGRESS);
      imported = total;
      onProgress(imported);
      offset += page.stations.length;
      if (page.stations.length < PAGE_SIZE) return imported;
    }
  };

  const importFromMirror = async (mirror: string, onProgress: Progress, signal: AbortSignal) => {
    const generationId = await createStagingGeneration(db, mirror);
    try {
      const count = await importFrom(mirror, generationId, onProgress, signal);
      signal.throwIfAborted();
      if (count === 0) throw new DirectoryError('invalid', EMPTY_CATALOG);
      await activateGeneration(db, generationId, mirror, count);
    } catch (error) {
      await deleteGeneration(db, generationId);
      throw error;
    }
  };

  const run = async (onProgress: Progress, signal: AbortSignal) => {
    const mirrors = await client.findMirrors(await getMetadata(db, 'last_mirror'), signal);
    let lastError: unknown = new DirectoryError('invalid', EMPTY_CATALOG);
    // Offsets of different servers are unrelated: each mirror restarts from page one in its own staging.
    for (const mirror of mirrors.slice(0, MAX_MIRRORS)) {
      try {
        await importFromMirror(mirror, onProgress, signal);
      } catch (error) {
        if (signal.aborted) throw error;
        lastError = error;
        continue;
      }
      // The new catalog is already active: a failed cleanup is retried at the next app start.
      await deleteInactiveGenerations(db).catch(() => undefined);
      return;
    }
    throw lastError;
  };

  return {
    /** Full download into a new generation (GLOSSARY: Refresh). */
    refresh(onProgress: Progress = () => {}) {
      if (running) return running; // one sync at a time: repeated requests join it
      controller = new AbortController();
      running = run(onProgress, controller.signal).finally(() => (running = null));
      return running;
    },
    cancel() {
      controller?.abort();
    },
  };
}

export type CatalogSync = ReturnType<typeof createCatalogSync>;
