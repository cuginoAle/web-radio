/** The downloaded APK: opaque to callers, handed back to `Installer.open`. */
export type ApkFile = { readonly uri: string };

/** Port to the device: downloading the update APK and handing it to Android's installer. */
export type Installer = {
  /** Downloads into the one fixed APK file (overwritten each time); rejects on any failure, partial file left behind. */
  download: (url: string, onProgress: (percent: number) => void) => Promise<ApkFile>;
  /** Hands the APK to Android's package installer; resolves once the installer is on screen. */
  open: (file: ApkFile) => Promise<void>;
  /** Deletes the downloaded or partial file if there is one. Never throws. */
  discard: () => Promise<void>;
};
