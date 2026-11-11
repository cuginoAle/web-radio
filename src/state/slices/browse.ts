import type { StateCreator } from 'zustand';

import type { GlobalState } from '@/state/global-state';

export type SelectedTag = { key: string; label: string };

// Kept in the store so the search survives the compact <-> three-column layout swap.
export type BrowseSlice = {
  searchQuery: string;
  selectedTag: SelectedTag | null;
  setSearchQuery: (searchQuery: string) => void;
  setSelectedTag: (selectedTag: SelectedTag | null) => void;
};

export const createBrowseSlice: StateCreator<GlobalState, [], [], BrowseSlice> = (set) => ({
  searchQuery: '',
  selectedTag: null,
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedTag: (selectedTag) => set({ selectedTag }),
});
