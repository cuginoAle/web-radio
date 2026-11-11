import { createStore, useStore, type StoreApi } from 'zustand';

import { createBrowseSlice, type BrowseSlice } from '@/state/slices/browse';
import { createCatalogSlice, type CatalogSlice } from '@/state/slices/catalog';
import { createFavoritesSlice, type FavoritesSlice } from '@/state/slices/favorites';
import { createPlayerSlice, type PlayerSlice } from '@/state/slices/player';

// The only global store (ADR 0002). Add new concerns as slices, never as new stores.
export type GlobalState = PlayerSlice & FavoritesSlice & BrowseSlice & CatalogSlice;
export type GlobalStore = StoreApi<GlobalState>;

export const createGlobalStore = (): GlobalStore =>
  createStore<GlobalState>()((...args) => ({
    ...createPlayerSlice(...args),
    ...createFavoritesSlice(...args),
    ...createBrowseSlice(...args),
    ...createCatalogSlice(...args),
  }));

export const globalStore = createGlobalStore();

export const useGlobalState = <T>(selector: (state: GlobalState) => T): T => useStore(globalStore, selector);
