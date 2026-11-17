import { File, Paths } from 'expo-file-system';

import type { ApkFile, Installer } from '@/services/update-install/types';

const APK_MIME = 'application/vnd.android.package-archive';

/** The one hand-off to Android's installer (ACTION_VIEW on a FileProvider content URI). Kept apart so it can be swapped for an intent. */
const handOff = (file: ApkFile) => new File(file.uri).preview({ mimeType: APK_MIME });

/** Real device installer. One fixed cache file, overwritten by every download. */
export function createInstaller(): Installer {
  const apk = () => new File(Paths.cache, 'update.apk');

  return {
    async download(url, onProgress) {
      const task = File.createDownloadTask(url, apk(), {
        // totalBytes is -1 without a Content-Length: the percentage then stays at 0
        onProgress: ({ bytesWritten, totalBytes }) =>
          onProgress(totalBytes > 0 ? Math.floor((bytesWritten / totalBytes) * 100) : 0),
      });
      const file = await task.downloadAsync(); // rejects on non-2xx; null only if paused, which never happens here
      if (!file) throw new Error('Download did not complete');
      return file;
    },

    open: handOff,

    async discard() {
      try {
        const file = apk();
        if (file.exists) file.delete();
      } catch {
        // Best effort: a leftover file is only dead weight.
      }
    },
  };
}
