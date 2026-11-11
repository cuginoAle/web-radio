import { router } from 'expo-router';

import { globalStore } from '@/state/global-state';
import type { SelectedTag } from '@/state/slices/browse';

/** A tag opens Search filtered by it (the only "list context" of the app is tag + query). */
export const openTag = (tag: SelectedTag) => {
  const { setSelectedTag, setSearchQuery } = globalStore.getState();
  setSearchQuery('');
  setSelectedTag({ key: tag.key, label: tag.label });
  router.navigate('/search');
};
