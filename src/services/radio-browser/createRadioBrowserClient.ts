import { DirectoryError } from '@/services/radio-browser/DirectoryError';

type Fetch = (url: string, init?: RequestInit) => Promise<Response>;

type Deps = {
  fetch: Fetch;
  userAgent: string;
};

const RETRY_WAIT_MS = 2_000;
const TIMEOUT_MS = 30_000;
const NETWORK_ERROR = 'Impossibile raggiungere la directory delle radio. Serve una connessione a Internet.';

const BOOTSTRAP_MIRRORS = ['de1.api.radio-browser.info', 'all.api.radio-browser.info'];
const MAX_MIRRORS = 3;
const HOSTNAME = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i;

const unique = (hosts: (string | null)[]) => [...new Set(hosts.filter((h): h is string => !!h))];

const aborted = () => new DirectoryError('aborted', 'Operazione annullata.');

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(aborted());
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => (clearTimeout(timer), reject(aborted())), { once: true });
  });

export function createRadioBrowserClient({ fetch, userAgent }: Deps) {
  const attempt = async (url: string, signal?: AbortSignal) => {
    if (signal?.aborted) throw aborted();
    const controller = new AbortController();
    const cancel = () => controller.abort();
    const timer = setTimeout(cancel, TIMEOUT_MS);
    signal?.addEventListener('abort', cancel, { once: true });
    try {
      const response = await fetch(url, { headers: { 'User-Agent': userAgent }, signal: controller.signal }).catch(() => {
        throw signal?.aborted ? aborted() : new DirectoryError('network', NETWORK_ERROR, true);
      });
      if (!response.ok) {
        const transient = response.status >= 500 || response.status === 429;
        throw new DirectoryError('server', `La directory ha risposto con l’errore ${response.status}.`, transient);
      }
      return await (response.json() as Promise<unknown>).catch(() => {
        throw new DirectoryError('invalid', 'La directory ha inviato una risposta non leggibile.');
      });
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', cancel);
    }
  };

  // One transient retry on the same mirror; switching mirror is the caller's decision.
  const get = async (mirror: string, path: string, params: Record<string, string>, signal?: AbortSignal) => {
    const url = `https://${mirror}${path}?${new URLSearchParams(params)}`;
    try {
      return await attempt(url, signal);
    } catch (error) {
      if (!(error instanceof DirectoryError && error.transient)) throw error;
      await wait(RETRY_WAIT_MS, signal);
      return attempt(url, signal);
    }
  };

  const announcedMirrors = (servers: unknown) =>
    Array.isArray(servers) ? servers.map((s) => s?.name).filter((n) => typeof n === 'string' && HOSTNAME.test(n)) : [];

  return {
    /** Candidate HTTPS mirrors for one operation: the last good one is only a bootstrap hint. */
    async findMirrors(lastGood: string | null, signal?: AbortSignal) {
      const known = unique([lastGood, ...BOOTSTRAP_MIRRORS]);
      for (const host of known) {
        try {
          const servers = await attempt(`https://${host}/json/servers`, signal);
          return unique([lastGood, ...announcedMirrors(servers), ...BOOTSTRAP_MIRRORS]).slice(0, MAX_MIRRORS);
        } catch (error) {
          if (error instanceof DirectoryError && error.kind === 'aborted') throw error;
        }
      }
      return known.slice(0, MAX_MIRRORS);
    },

    /** Directory click counter: fire-and-forget, a single attempt so one play never counts twice. */
    async reportClick(mirror: string, uuid: string) {
      await attempt(`https://${mirror}/json/url/${encodeURIComponent(uuid)}`).catch(() => undefined);
    },

    /** One page of the full directory, in a repeatable order. */
    fetchStationsPage: (mirror: string, offset: number, limit: number, signal?: AbortSignal) =>
      get(
        mirror,
        '/json/stations',
        { order: 'name', reverse: 'false', hidebroken: 'false', offset: String(offset), limit: String(limit) },
        signal,
      ),
  };
}

export type RadioBrowserClient = ReturnType<typeof createRadioBrowserClient>;
