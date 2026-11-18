import { useCallback, useState } from 'react';

import { isInstallExplained, setInstallExplained } from '@/db/queries/updateCheck';
import { askInstallExplainer } from '@/helpers/updates/askInstallExplainer';
import type { AvailableUpdate } from '@/helpers/updates/pickUpdate';
import { getRuntime } from '@/services/runtime';
import type { Installer } from '@/services/update-install/types';

export type InstallStatus = 'idle' | 'downloading' | 'failed';

// The installer overwrites one cache file, so it takes one explainer or download at a time, from Discover or About.
let busyInstaller: Installer | null = null;

/** Install / Retry for the Update notice: first-time explainer, download with progress, hand-off to Android's installer. */
export function useInstallUpdate(update: AvailableUpdate | null) {
  const [status, setStatus] = useState<InstallStatus>('idle');
  const [percent, setPercent] = useState(0);

  const install = useCallback(async () => {
    const { db, installer } = getRuntime();
    if (!update || busyInstaller === installer) return;
    busyInstaller = installer;
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
      busyInstaller = null;
    }
  }, [update]);

  return { status, percent, install };
}
