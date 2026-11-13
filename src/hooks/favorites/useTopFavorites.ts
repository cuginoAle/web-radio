import { useIsFocused } from 'expo-router';
import { useEffect, useState } from 'react';

import type { FavoriteItem } from '@/db/queries/favorites';
import { listTopFavorites } from '@/db/queries/listeningTime';
import { getRuntime } from '@/services/runtime';
import { useGlobalState } from '@/state/global-state';

/** GLOSSARY: Preferito più ascoltato. Re-read on focus and after favorites change, never while on screen. */
export function useTopFavorites() {
  const focused = useIsFocused();
  const uuids = useGlobalState((s) => s.favoriteUuids);
  const version = useGlobalState((s) => s.catalogVersion);
  const [items, setItems] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    if (!focused) return;
    let active = true;
    listTopFavorites(getRuntime().db).then(
      (rows) => active && setItems(rows),
      () => undefined, // a shortcut like the tags: hidden rather than an error
    );
    return () => {
      active = false;
    };
  }, [focused, uuids, version]);

  // A removal hides the pill at once, before the database read comes back.
  return items.filter((item) => uuids.has(item.uuid));
}
