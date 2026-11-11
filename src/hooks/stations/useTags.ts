import { useEffect, useState } from 'react';

import { listTags, type TagGroup } from '@/db/queries/stations';
import { getRuntime } from '@/services/runtime';
import { useGlobalState } from '@/state/global-state';

/** Tag groups of the active catalog, largest first; all of them without a limit. */
export function useTags(limit?: number) {
  const version = useGlobalState((s) => s.catalogVersion);
  const [tags, setTags] = useState<TagGroup[]>([]);

  useEffect(() => {
    let active = true;
    listTags(getRuntime().db, limit).then(
      (rows) => active && setTags(rows),
      () => undefined, // tags are a shortcut: the station list reports database errors
    );
    return () => {
      active = false;
    };
  }, [limit, version]);

  return tags;
}
