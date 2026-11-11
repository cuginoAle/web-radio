import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import { bootstrap } from '@/services/bootstrap';

void SplashScreen.preventAutoHideAsync();

let started: Promise<void> | null = null;

/** Opens the local data once per process; never waits for a server. */
export function useBootstrap() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    started ??= bootstrap();
    started.then(
      () => setStatus('ready'),
      () => setStatus('error'),
    ).finally(() => void SplashScreen.hideAsync());
  }, []);

  return status;
}
