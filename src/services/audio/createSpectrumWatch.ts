import type { SessionPlayer } from '@/services/audio/types';

type Listener = (bands: number[]) => void;

/** The Spectrum is measured only while someone watches it; watching returns how to stop. */
export function createSpectrumWatch(player: SessionPlayer) {
  const watchers = new Set<Listener>();
  player.addListener('spectrumUpdate', ({ bands }) => watchers.forEach((watch) => watch(bands)));

  return (listener: Listener) => {
    watchers.add(listener);
    player.setSpectrumEnabled(true);
    return () => {
      watchers.delete(listener);
      if (watchers.size === 0) player.setSpectrumEnabled(false);
    };
  };
}
