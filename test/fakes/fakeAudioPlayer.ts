import type { AudioMetadata, AudioStatus } from 'expo-audio';

const baseStatus: AudioStatus = {
  id: 'fake',
  currentTime: 0,
  playbackState: 'idle',
  timeControlStatus: 'paused',
  reasonForWaitingToPlay: '',
  mute: false,
  duration: 0,
  playing: false,
  loop: false,
  didJustFinish: false,
  isBuffering: false,
  isLoaded: false,
  playbackRate: 1,
  shouldCorrectPitch: true,
  isLive: true,
  currentOffsetFromLive: null,
  error: null,
};

// Stands in for the native expo-audio player: records what the app asked for, emits status on demand.
export class FakeAudioPlayer {
  uri: string | null = null;
  playing = false;
  lockScreen: AudioMetadata | null = null;
  private listener: ((status: AudioStatus) => void) | null = null;

  replace(source: { uri: string }) {
    this.uri = source.uri;
    this.playing = false;
  }

  play() {
    this.playing = true;
  }

  pause() {
    this.playing = false;
  }

  addListener(_event: 'playbackStatusUpdate', listener: (status: AudioStatus) => void) {
    this.listener = listener;
    return { remove: () => (this.listener = null) };
  }

  setActiveForLockScreen(active: boolean, metadata?: AudioMetadata) {
    this.lockScreen = active ? (metadata ?? {}) : null;
  }

  updateLockScreenMetadata(metadata: AudioMetadata) {
    this.lockScreen = metadata;
  }

  emit(partial: Partial<AudioStatus>) {
    this.listener?.({ ...baseStatus, ...partial });
  }

  /** The stream is audibly playing (the native player reports it too). */
  emitPlaying() {
    this.playing = true;
    this.emit({ playing: true, playbackState: 'ready', isLoaded: true });
  }

  /** The stream failed (expo-audio sends a transient `error`). */
  emitError(message = 'Source error') {
    this.emit({ error: message, playing: false, playbackState: 'idle' });
  }
}
