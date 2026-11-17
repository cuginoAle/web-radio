import { useEffect } from 'react';
import { useReducedMotion, useSharedValue } from 'react-native-reanimated';

import { useAppActive } from '@/hooks/app/useAppActive';
import { getRuntime } from '@/services/runtime';
import { useGlobalState } from '@/state/global-state';

/**
 * The Spectrum (GLOSSARY) as a shared value, or null when it must not be drawn: nothing audible, or
 * the user asked for no animations. It is measured only while it can be seen, and never enters the store.
 */
export function useSpectrum() {
  const playing = useGlobalState((s) => s.player.status === 'playing');
  const shown = !useReducedMotion() && playing;
  const measuring = useAppActive() && shown;
  const levels = useSharedValue<number[]>([]);

  useEffect(() => {
    if (!measuring) return;
    const stop = getRuntime().audio.watchSpectrum((bands) => levels.set(bands));
    return () => {
      stop();
      levels.set([]);
    };
  }, [measuring, levels]);

  return shown ? levels : null;
}
