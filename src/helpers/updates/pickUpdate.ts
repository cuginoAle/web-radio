import { isNewerVersion } from '@/helpers/updates/isNewerVersion';

export type AvailableUpdate = { version: string; url: string };

const APK_NAME = /^NoSpyFi-\d+\.\d+\.\d+\.apk$/;

/** The update a GitHub "latest release" body offers over `installed`, or null. Cleartext download URLs are refused (the app allows cleartext globally). */
export function pickUpdate(release: unknown, installed: string): AvailableUpdate | null {
  const { tag_name, assets } = (release ?? {}) as { tag_name?: unknown; assets?: unknown };
  if (typeof tag_name !== 'string') return null;
  const version = tag_name.replace(/^v/, '');
  if (!isNewerVersion(version, installed) || !Array.isArray(assets)) return null;
  const apk = assets.find((a) => typeof a?.name === 'string' && APK_NAME.test(a.name));
  const url = apk?.browser_download_url;
  return typeof url === 'string' && url.startsWith('https://') ? { version, url } : null;
}
