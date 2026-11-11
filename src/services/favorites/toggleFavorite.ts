import { addFavorite, removeFavorite } from '@/db/queries/favorites';
import type { StationItem } from '@/db/queries/stations';
import { getRuntime } from '@/services/runtime';
import { globalStore } from '@/state/global-state';

/** Updates every surface at once, then persists; a failed write restores the previous state. */
export async function toggleFavorite(station: StationItem) {
  const { db } = getRuntime();
  const state = globalStore.getState();
  const previous = state.favoriteUuids;
  const isFavorite = previous.has(station.uuid);
  const next = new Set(previous);
  if (isFavorite) next.delete(station.uuid);
  else next.add(station.uuid);
  state.setFavoriteUuids(next);
  try {
    if (isFavorite) await removeFavorite(db, station.uuid);
    else await addFavorite(db, station);
  } catch {
    globalStore.getState().setFavoriteUuids(previous);
  }
}
