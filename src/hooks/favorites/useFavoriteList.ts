import { useEffect, useState } from 'react';

import { listFavorites, type FavoriteItem } from '@/db/queries/favorites';
import { getRuntime } from '@/services/runtime';
import { useGlobalState } from '@/state/global-state';

/** Favorites joined to the active catalog; re-reads after any toggle or catalog switch. */
export function useFavoriteList() {
  const uuids = useGlobalState((s) => s.favoriteUuids);
  const version = useGlobalState((s) => s.catalogVersion);
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    listFavorites(getRuntime().db).then(
      (rows) => {
        if (!active) return;
        setItems(rows);
        setStatus('ready');
      },
      () => active && setStatus('error'),
    );
    return () => {
      active = false;
    };
  }, [uuids, version, attempt]);

  return {
    // A removal hides the row at once, before the database read comes back.
    items: items.filter((item) => uuids.has(item.uuid)),
    status,
    retry: () => setAttempt((n) => n + 1),
  };
}
