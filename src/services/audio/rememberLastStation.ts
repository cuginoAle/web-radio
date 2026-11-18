import type { StationSnapshot } from '@/services/audio/types';
import type { GlobalStore } from '@/state/global-state';

/** Hands `save` every station that becomes audible (GLOSSARY: Last station), once per change of station. */
export function rememberLastStation(store: GlobalStore, save: (station: StationSnapshot) => void) {
  let uuid: string | null = null;

  return store.subscribe(({ player: { status, station } }) => {
    if (status !== 'playing' || !station || station.uuid === uuid) return;
    uuid = station.uuid;
    save(station);
  });
}
