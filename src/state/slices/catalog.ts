import type { StateCreator } from 'zustand';

import type { GlobalState } from '@/state/global-state';
import type { CatalogStatus } from '@/db/queries/catalog';

export type SyncPhase = 'idle' | 'running' | 'done' | 'cancelled' | 'failed';

export type SyncState = {
  phase: SyncPhase;
  imported: number;
  error: string | null;
};

export type CatalogSlice = {
  catalog: CatalogStatus;
  /** Bumped when the active generation changes: lists re-query, filters stay. */
  catalogVersion: number;
  sync: SyncState;
  setCatalog: (catalog: CatalogStatus) => void;
  setSync: (patch: Partial<SyncState>) => void;
};

export const createCatalogSlice: StateCreator<GlobalState, [], [], CatalogSlice> = (set) => ({
  catalog: { generationId: null, stationCount: 0, lastSuccessAt: null },
  catalogVersion: 0,
  sync: { phase: 'idle', imported: 0, error: null },
  setCatalog: (catalog) => set((state) => ({ catalog, catalogVersion: state.catalogVersion + 1 })),
  setSync: (patch) => set((state) => ({ sync: { ...state.sync, ...patch } })),
});
