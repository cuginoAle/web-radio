import { getStation, type StationItem } from '@/db/queries/stations';
import type { StationSnapshot } from '@/services/audio/types';
import { toggleFavorite } from '@/services/favorites/toggleFavorite';
import { getRuntime } from '@/services/runtime';
import { useGlobalState } from '@/state/global-state';

// A station that left the catalog while being listened to can still be saved from its snapshot.
const snapshotAsStation = ({ uuid, name, streamUrl, favicon }: StationSnapshot): StationItem => ({
  uuid,
  name,
  url: streamUrl,
  urlResolved: '',
  favicon,
  country: '',
  firstTag: null,
  bitrate: 0,
  lastCheckOk: true,
});

/** Controls shared by the mini-player, the full player and the tablet panel. */
export function usePlayerControls() {
  const player = useGlobalState((s) => s.player);
  const isFavorite = useGlobalState((s) => !!s.player.station && s.favoriteUuids.has(s.player.station.uuid));
  const isActive = player.status === 'playing' || player.status === 'loading' || player.status === 'buffering';

  const toggleMain = () => {
    const { audio } = getRuntime();
    if (isActive) audio.pause();
    else audio.resume();
  };

  const onToggleFavorite = async () => {
    if (!player.station) return;
    const station = await getStation(getRuntime().db, player.station.uuid);
    await toggleFavorite(station ?? snapshotAsStation(player.station));
  };

  return {
    player,
    isActive,
    isFavorite,
    toggleMain,
    onToggleFavorite: () => void onToggleFavorite(),
    next: () => void getRuntime().audio.next(),
    previous: () => void getRuntime().audio.previous(),
    retry: () => getRuntime().audio.retry(),
  };
}
