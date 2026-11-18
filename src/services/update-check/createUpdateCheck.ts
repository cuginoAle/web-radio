import type { Db } from '@/db/types';
import {
  getLastCheckAt,
  getSnoozedUntil,
  getStoredUpdate,
  isUpdateCheckEnabled,
  setLastCheckAt,
  setSnoozedUntil,
  storeUpdate,
} from '@/db/queries/updateCheck';
import { isNewerVersion } from '@/helpers/updates/isNewerVersion';
import { pickUpdate } from '@/helpers/updates/pickUpdate';

type Deps = {
  db: Db;
  fetch: (url: string, init?: RequestInit) => Promise<Response>;
  userAgent: string;
  installedVersion: string;
  now?: () => number;
};

const LATEST_RELEASE = 'https://api.github.com/repos/cuginoAle/web-radio/releases/latest';
const TIMEOUT_MS = 30_000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** GLOSSARY: Update check. The only request the app makes to GitHub; every failure is silent. */
export function createUpdateCheck({ db, fetch, userAgent, installedVersion, now = Date.now }: Deps) {
  const request = async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(LATEST_RELEASE, {
        headers: { Accept: 'application/vnd.github+json', 'User-Agent': userAgent },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`GitHub answered ${response.status}`);
      return pickUpdate(await response.json(), installedVersion);
    } finally {
      clearTimeout(timer);
    }
  };

  /** Asks GitHub right away; the attempt is recorded even if it fails. Resolves to the newer release, if any. */
  const checkNow = async () => {
    await setLastCheckAt(db, now());
    const update = await request();
    if (update) await storeUpdate(db, update);
    return update;
  };

  return {
    /** Asks GitHub at most once a day, only when the setting is on. */
    async check() {
      try {
        if (!(await isUpdateCheckEnabled(db)) || now() - (await getLastCheckAt(db)) < DAY_MS) return;
        await checkNow();
      } catch {
        // Silent by design: no error UI, the next daily check tries again.
      }
    },

    /** The Check now button: ignores the setting and the daily limit, and rejects when GitHub can't be asked. */
    checkNow,

    /** The update to tell the user about: stored, newer than installed, setting on and not snoozed. */
    async current() {
      if (!(await isUpdateCheckEnabled(db)) || now() < (await getSnoozedUntil(db))) return null;
      const stored = await getStoredUpdate(db);
      return stored && isNewerVersion(stored.version, installedVersion) ? stored : null;
    },

    /** "Not now": hides the notice for 24 h. */
    snooze: () => setSnoozedUntil(db, now() + DAY_MS),
  };
}

export type UpdateCheck = ReturnType<typeof createUpdateCheck>;
