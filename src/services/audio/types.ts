import type { AudioEvents, AudioLockScreenOptions, AudioMetadata } from 'expo-audio';

/** What the audio session keeps of a station: survives catalog refreshes and cleanup. */
export type StationSnapshot = {
  uuid: string;
  name: string;
  streamUrl: string;
  favicon: string | null;
  subtitle: string;
};

/** Frozen UUIDs that previous/next walk through (see GLOSSARY: Source list). */
export type SourceList = {
  uuids: string[];
  index: number;
};

/** The subset of the expo-audio player the session relies on. */
export type SessionPlayer = {
  readonly playing: boolean;
  replace(source: { uri: string }): void;
  play(): void;
  pause(): void;
  addListener<E extends 'playbackStatusUpdate' | 'streamMetadataUpdate' | 'spectrumUpdate'>(
    event: E,
    listener: AudioEvents[E],
  ): { remove(): void };
  setSpectrumEnabled(enabled: boolean): void;
  setActiveForLockScreen(active: boolean, metadata?: AudioMetadata, options?: AudioLockScreenOptions): void;
  updateLockScreenMetadata(metadata: AudioMetadata): void;
};
