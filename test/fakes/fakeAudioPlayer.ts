import type { AudioEvents, AudioMetadata, AudioStatus } from 'expo-audio';

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
  spectrumEnabled = false;
  private listeners: Partial<AudioEvents> = {};

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

  addListener<E extends keyof AudioEvents>(event: E, listener: AudioEvents[E]) {
    this.listeners[event] = listener;
    return { remove: () => delete this.listeners[event] };
  }

  setActiveForLockScreen(active: boolean, metadata?: AudioMetadata) {
    this.lockScreen = active ? (metadata ?? {}) : null;
  }

  updateLockScreenMetadata(metadata: AudioMetadata) {
    this.lockScreen = metadata;
  }

  setSpectrumEnabled(enabled: boolean) {
    this.spectrumEnabled = enabled;
  }

  emit(partial: Partial<AudioStatus>) {
    this.listeners.playbackStatusUpdate?.({ ...baseStatus, ...partial });
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

  /** The stream announces what is on air (ICY `StreamTitle`, via the patched expo-audio). */
  emitTitle(title: string) {
    this.listeners.streamMetadataUpdate?.({ title });
  }

  /** The native tap measured the audio (Spectrum, via the patched expo-audio). */
  emitSpectrum(bands: number[]) {
    this.listeners.spectrumUpdate?.({ bands });
  }
}
