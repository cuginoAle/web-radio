import { useCallback, useState } from 'react';

import type { AvailableUpdate } from '@/helpers/updates/pickUpdate';
import { getRuntime } from '@/services/runtime';

export type CheckNowStatus = 'idle' | 'checking' | 'latest' | 'available' | 'failed';

/** The Check now button (GLOSSARY: Update check). The outcome belongs to this visit to About only. */
export function useCheckNow() {
  const [status, setStatus] = useState<CheckNowStatus>('idle');
  const [update, setUpdate] = useState<AvailableUpdate | null>(null);

  const check = useCallback(async () => {
    setStatus('checking');
    setUpdate(null);
    try {
      const found = await getRuntime().updates.checkNow();
      setUpdate(found);
      setStatus(found ? 'available' : 'latest');
    } catch {
      setStatus('failed');
    }
  }, []);

  /** "Not now": same meaning as on Discover, a 24 h snooze. */
  const snooze = useCallback(async () => {
    await getRuntime().updates.snooze();
    setUpdate(null);
    setStatus('idle');
  }, []);

  return { status, update, check, snooze };
}
