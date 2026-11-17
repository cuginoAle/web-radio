import { useIsFocused } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { useAppActive } from '@/hooks/app/useAppActive';
import type { AvailableUpdate } from '@/helpers/updates/pickUpdate';
import { getRuntime } from '@/services/runtime';

/**
 * The Update notice to show, if any. Runs the daily-gated Update check whenever the screen is
 * focused and the app is in the foreground: cold start, coming back from background, and coming
 * back from About NoSpyFi (where the setting may have changed).
 */
export function useUpdateNotice() {
  const [notice, setNotice] = useState<AvailableUpdate | null>(null);
  const active = useAppActive();
  const focused = useIsFocused();

  useEffect(() => {
    if (!active || !focused) return;
    let current = true;
    const { updates } = getRuntime();
    updates
      .check()
      .then(() => updates.current())
      .then((update) => current && setNotice(update))
      .catch(() => undefined);
    return () => {
      current = false;
    };
  }, [active, focused]);

  const snooze = useCallback(async () => {
    await getRuntime().updates.snooze();
    setNotice(null);
  }, []);

  return { notice, snooze };
}
