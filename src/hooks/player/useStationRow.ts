import type { StationItem } from '@/db/queries/stations';
import { playFromList } from '@/services/audio/playFromList';
import { toggleFavorite } from '@/services/favorites/toggleFavorite';
import { getRuntime } from '@/services/runtime';
import { useGlobalState } from '@/state/global-state';

/** Row behavior: starting the station, or controlling it when it is the one in the session. */
export function useStationRow(station: StationItem, loadUuids: () => Promise<string[]>) {
  const playback = useGlobalState((s) => (s.player.station?.uuid === station.uuid ? s.player.status : null));
  const isFavorite = useGlobalState((s) => s.favoriteUuids.has(station.uuid));

  const onPlay = () => {
    const { audio } = getRuntime();
    if (playback === null || playback === 'idle') return void playFromList(station, loadUuids);
    if (playback === 'paused') return audio.resume();
    if (playback === 'error') return audio.retry();
    audio.pause();
  };

  return { playback, isFavorite, onPlay, onToggleFavorite: () => void toggleFavorite(station) };
}
