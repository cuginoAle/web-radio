import type { Db } from '@/db/types';
import type { AudioSession } from '@/services/audio/createAudioSession';
import type { CatalogSync } from '@/services/catalog-sync/createCatalogSync';

/** The long-lived services, created once at startup (tests install their own). */
export type Runtime = {
  db: Db;
  audio: AudioSession;
  sync: CatalogSync;
};

let runtime: Runtime | null = null;

export const setRuntime = (next: Runtime) => {
  runtime = next;
};

export const getRuntime = (): Runtime => {
  if (!runtime) throw new Error('Runtime not started');
  return runtime;
};
