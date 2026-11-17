import { useCallback, useEffect, useState } from 'react';

import { isUpdateCheckEnabled, setUpdateCheckEnabled } from '@/db/queries/updateCheck';
import { getRuntime } from '@/services/runtime';

/** The stored Update check setting; a failed write puts the previous value back. */
export function useUpdateCheckSetting() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    isUpdateCheckEnabled(getRuntime().db).then(setEnabled, () => undefined);
  }, []);

  const update = useCallback(
    async (next: boolean) => {
      const previous = enabled;
      setEnabled(next);
      try {
        await setUpdateCheckEnabled(getRuntime().db, next);
      } catch {
        setEnabled(previous);
      }
    },
    [enabled],
  );

  return { enabled, update };
}
