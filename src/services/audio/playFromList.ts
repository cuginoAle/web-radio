import type { StationItem } from '@/db/queries/stations';
import { toSnapshot } from '@/helpers/player/toSnapshot';
import { getRuntime } from '@/services/runtime';

let latest = 0;

/** Freezes the source list and starts the station; only the most recent tap wins. */
export async function playFromList(station: StationItem, loadUuids: () => Promise<string[]>) {
  const mine = ++latest;
  const uuids = await loadUuids().catch(() => [station.uuid]);
  if (mine !== latest) return;
  const index = uuids.indexOf(station.uuid);
  getRuntime().audio.play(
    toSnapshot(station),
    index >= 0 ? { uuids, index } : { uuids: [station.uuid], index: 0 },
  );
}
