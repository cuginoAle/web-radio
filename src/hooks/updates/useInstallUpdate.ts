import { useCallback, useRef, useState } from 'react';

import { isInstallExplained, setInstallExplained } from '@/db/queries/updateCheck';
import { askInstallExplainer } from '@/helpers/updates/askInstallExplainer';
import type { AvailableUpdate } from '@/helpers/updates/pickUpdate';
import { getRuntime } from '@/services/runtime';

export type InstallStatus = 'idle' | 'downloading' | 'failed';

/** Install / Retry for the Update notice: first-time explainer, download with progress, hand-off to Android's installer. */
export function useInstallUpdate(update: AvailableUpdate | null) {
  const [status, setStatus] = useState<InstallStatus>('idle');
  const [percent, setPercent] = useState(0);
  const busy = useRef(false); // a second tap must not stack a second explainer or download

  const install = useCallback(async () => {
    if (!update || busy.current) return;
    busy.current = true;
    const { db, installer } = getRuntime();
    try {
      if (!(await isInstallExplained(db))) {
        if (!(await askInstallExplainer())) return;
        await setInstallExplained(db);
      }
      setPercent(0);
      setStatus('downloading');
      try {
        await installer.open(await installer.download(update.url, setPercent));
        setStatus('idle'); // backed out of Android's installer: Install works again
      } catch {
        await installer.discard();
        setStatus('failed');
      }
    } finally {
      busy.current = false;
    }
  }, [update]);

  return { status, percent, install };
}
