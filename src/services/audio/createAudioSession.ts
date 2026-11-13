import type { AudioStatus } from 'expo-audio';

import type { SessionPlayer, SourceList, StationSnapshot } from '@/services/audio/types';
import type { GlobalStore } from '@/state/global-state';
import type { PlayerState } from '@/state/slices/player';

const PLAYBACK_ERROR =
  'Impossibile riprodurre questa radio. Controlla la connessione a Internet o prova un’altra stazione.';
const RECONNECT_DELAYS_MS = [2_000, 4_000];
const LIVE_LABEL = 'Radio in diretta';

type Deps = {
  player: SessionPlayer;
  store: GlobalStore;
  /** Fire-and-forget directory click counter; must never block or retry. */
  reportClick: (uuid: string) => void;
  /** Looks a station up in the active catalog; null when it is no longer there. */
  resolveStation: (uuid: string) => Promise<StationSnapshot | null>;
};

export function createAudioSession({ player, store, reportClick, resolveStation }: Deps) {
  const setPlayer = (patch: Partial<PlayerState>) => store.getState().setPlayer(patch);
  const current = () => store.getState().player;

  let hasPlayed = false; // only a stream that actually played gets reconnected
  let attempts = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lockScreenActive = false;
  let list: SourceList = { uuids: [], index: -1 };
  let intent = 0; // bumped by every user action: async work started earlier must not override it

  const cancelReconnect = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  const showError = () => setPlayer({ status: 'error', error: PLAYBACK_ERROR });

  const start = (station: StationSnapshot) => {
    try {
      if (!station.streamUrl) return showError();
      player.replace({ uri: station.streamUrl });
      player.play();
    } catch {
      showError(); // expo-audio throws synchronously on sources it cannot build
    }
  };

  const showOnLockScreen = (station: StationSnapshot, nowPlaying: string | null = null) => {
    const metadata = { title: station.name, artist: nowPlaying ?? LIVE_LABEL, artworkUrl: station.favicon ?? undefined };
    if (lockScreenActive) return player.updateLockScreenMetadata(metadata);
    // Android stops background audio after ~3 min unless the lock screen session is active.
    player.setActiveForLockScreen(true, metadata, { isLiveStream: true, showSeekForward: false, showSeekBackward: false });
    lockScreenActive = true;
  };

  const load = (station: StationSnapshot) => {
    cancelReconnect();
    hasPlayed = false;
    attempts = 0;
    setPlayer({ status: 'loading', station, error: null, nowPlaying: null });
    start(station);
    showOnLockScreen(station);
  };

  // Resume and retry both go back to the live stream of the current station.
  const reload = () => {
    intent++;
    const { station } = current();
    if (station) load(station);
  };

  const fail = () => {
    const { station } = current();
    if (station && hasPlayed && attempts < RECONNECT_DELAYS_MS.length) {
      setPlayer({ status: 'buffering' });
      timer = setTimeout(() => start(station), RECONNECT_DELAYS_MS[attempts++]);
      return;
    }
    player.pause();
    showError();
  };

  player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
    const { status: shown } = current();
    if (shown === 'error') return; // `error` is transient in expo-audio: keep ours until the user acts
    const audible = status.playing && status.playbackState === 'ready';
    if (shown === 'paused') {
      // resumed from notification / lock screen; `player.playing` filters stale in-flight updates
      if (audible && player.playing) setPlayer({ status: 'playing' });
      return;
    }
    if (status.error) return fail();
    if (status.isBuffering && hasPlayed) return setPlayer({ status: 'buffering' });
    if (audible) {
      hasPlayed = true;
      attempts = 0;
      setPlayer({ status: 'playing' });
    } else if (hasPlayed && status.playbackState === 'ready') {
      cancelReconnect();
      setPlayer({ status: 'paused' }); // paused by the system or the notification
    }
  });

  player.addListener('streamMetadataUpdate', ({ title }) => {
    const { station } = current();
    if (!station) return;
    const nowPlaying = title.trim() || null;
    setPlayer({ nowPlaying });
    showOnLockScreen(station, nowPlaying);
  });

  const choose = (station: StationSnapshot, from: SourceList) => {
    intent++;
    list = from;
    setPlayer({ canPrevious: from.index > 0, canNext: from.index < from.uuids.length - 1 });
    load(station);
    reportClick(station.uuid);
  };

  const step = async (direction: 1 | -1) => {
    const mine = ++intent;
    for (let i = list.index + direction; i >= 0 && i < list.uuids.length; i += direction) {
      const station = await resolveStation(list.uuids[i]);
      if (mine !== intent) return;
      if (station) return choose(station, { uuids: list.uuids, index: i });
    }
  };

  return {
    play: choose,
    next: () => step(1),
    previous: () => step(-1),
    pause() {
      intent++;
      cancelReconnect();
      player.pause();
      setPlayer({ status: 'paused' });
    },
    resume: reload,
    retry: reload,
  };
}

export type AudioSession = ReturnType<typeof createAudioSession>;
