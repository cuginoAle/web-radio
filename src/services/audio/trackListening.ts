import type { GlobalStore } from '@/state/global-state';

const SAVE_EVERY_MS = 30_000;

/** Adds up the seconds a station is audible (GLOSSARY: Ascolto cumulato) and hands them to `save`. */
export function trackListening(store: GlobalStore, save: (uuid: string, seconds: number) => void) {
  let uuid: string | null = null; // the station being counted, null when nothing is audible
  let since = 0;
  let timer: ReturnType<typeof setInterval> | null = null;

  const flush = () => {
    const now = Date.now();
    if (uuid && now > since) save(uuid, (now - since) / 1000);
    since = now;
  };

  const stop = () => {
    flush();
    if (timer) clearInterval(timer);
    timer = null;
    uuid = null;
  };

  return store.subscribe(({ player }) => {
    const audible = player.status === 'playing' ? (player.station?.uuid ?? null) : null;
    if (audible === uuid) return;
    if (uuid) stop();
    if (!audible) return;
    uuid = audible;
    since = Date.now();
    timer = setInterval(flush, SAVE_EVERY_MS);
  });
}
