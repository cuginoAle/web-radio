import type { StateCreator } from 'zustand';

import type { GlobalState } from '@/state/global-state';

export type FavoritesSlice = {
  favoriteUuids: ReadonlySet<string>;
  setFavoriteUuids: (uuids: Iterable<string>) => void;
};

export const createFavoritesSlice: StateCreator<GlobalState, [], [], FavoritesSlice> = (set) => ({
  favoriteUuids: new Set(),
  setFavoriteUuids: (uuids) => set({ favoriteUuids: new Set(uuids) }),
});
