import type { RadioBrowserClient } from '@/services/radio-browser/createRadioBrowserClient';
import { rawStation, type RawStation } from '@test/fixtures/radioBrowserStation';

/** `count` directory records with uuids `${prefix}-0…` and names "Radio 0…". */
export const rawStations = (count: number, prefix = 's', overrides: RawStation = {}) =>
  Array.from({ length: count }, (_, i) =>
    rawStation({ stationuuid: `${prefix}-${i}`, name: `Radio ${prefix}${i}`, tags: 'jazz', ...overrides }),
  );

type PageHook = (mirror: string, offset: number, signal?: AbortSignal) => unknown | Promise<unknown>;

/**
 * A Radio Browser directory: each mirror serves a station list (paged by offset/limit) or fails with an error.
 * `beforePage` runs before each page is served and may replace it by returning a value.
 */
export function createFakeDirectory(mirrors: Record<string, RawStation[] | Error>) {
  const pages: { mirror: string; offset: number }[] = [];
  let beforePage: PageHook = () => undefined;

  const client: RadioBrowserClient = {
    findMirrors: async () => Object.keys(mirrors),
    fetchStationsPage: async (mirror, offset, limit, signal) => {
      pages.push({ mirror, offset });
      const replaced = await beforePage(mirror, offset, signal);
      if (replaced !== undefined) return replaced;
      const list = mirrors[mirror];
      if (list instanceof Error) throw list;
      return list.slice(offset, offset + limit);
    },
  };

  return {
    client,
    pages,
    setMirror: (mirror: string, list: RawStation[] | Error) => (mirrors[mirror] = list),
    beforePage: (hook: PageHook) => (beforePage = hook),
  };
}
