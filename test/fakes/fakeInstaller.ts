import type { ApkFile, Installer } from '@/services/update-install/types';

export type FakeDownload = {
  url: string;
  progress: (percent: number) => void;
  finish: () => void;
  fail: (error?: Error) => void;
};

/** The device boundary: downloads only move when the test says so; every call is recorded. */
export function createFakeInstaller() {
  const downloads: FakeDownload[] = [];
  const opened: ApkFile[] = [];
  const calls = { discard: 0, openError: null as Error | null };
  const file: ApkFile = { uri: 'file:///cache/update.apk' };

  const installer: Installer = {
    download: (url, onProgress) =>
      new Promise((resolve, reject) => {
        downloads.push({ url, progress: onProgress, finish: () => resolve(file), fail: (e) => reject(e ?? new Error('failed')) });
      }),
    open: async (f) => {
      if (calls.openError) throw calls.openError;
      opened.push(f);
    },
    discard: async () => {
      calls.discard += 1;
    },
  };
  return { installer, downloads, opened, calls, file };
}
