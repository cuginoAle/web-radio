import { useEffect, useRef, useState } from 'react';

import { listStations, type StationCursor, type StationFilter, type StationItem } from '@/db/queries/stations';
import { getRuntime } from '@/services/runtime';
import { useGlobalState } from '@/state/global-state';

type Result = { key: string; items: StationItem[]; next: StationCursor | null; failed: boolean };

/** Local paging of a list; a catalog switch re-queries while keeping query and tag. */
export function useStationList({ query, tag }: StationFilter) {
  const version = useGlobalState((s) => s.catalogVersion);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const loadingMore = useRef(false);
  const key = JSON.stringify([query ?? '', tag ?? null, version, attempt]);

  useEffect(() => {
    let active = true;
    listStations(getRuntime().db, { query, tag }).then(
      (page) => active && setResult({ key, items: page.items, next: page.next, failed: false }),
      () => active && setResult({ key, items: [], next: null, failed: true }),
    );
    return () => {
      active = false;
    };
  }, [key, query, tag]);

  const isCurrent = result?.key === key;

  const loadMore = () => {
    if (!isCurrent || !result?.next || loadingMore.current) return;
    loadingMore.current = true;
    listStations(getRuntime().db, { query, tag, after: result.next })
      .then((page) =>
        setResult((prev) => (prev?.key === key ? { ...prev, items: [...prev.items, ...page.items], next: page.next } : prev)),
      )
      .catch(() => undefined) // scrolling again retries
      .finally(() => {
        loadingMore.current = false;
      });
  };

  return {
    items: result?.items ?? [], // previous results stay visible while the new ones load
    status: !isCurrent ? ('loading' as const) : result.failed ? ('error' as const) : ('ready' as const),
    loadMore,
    retry: () => setAttempt((n) => n + 1),
  };
}
