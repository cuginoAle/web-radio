import type { StateCreator } from 'zustand';

import type { GlobalState } from '@/state/global-state';
import type { StationSnapshot } from '@/services/audio/types';

export type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'buffering' | 'error';

export type PlayerState = {
  status: PlayerStatus;
  station: StationSnapshot | null;
  error: string | null;
  /** What the stream announces as on air (see GLOSSARY: Now playing); null when it says nothing. */
  nowPlaying: string | null;
  canPrevious: boolean;
  canNext: boolean;
};

export type PlayerSlice = {
  player: PlayerState;
  setPlayer: (patch: Partial<PlayerState>) => void;
};

const initialPlayer: PlayerState = {
  status: 'idle',
  station: null,
  error: null,
  nowPlaying: null,
  canPrevious: false,
  canNext: false,
};

export const createPlayerSlice: StateCreator<GlobalState, [], [], PlayerSlice> = (set) => ({
  player: initialPlayer,
  setPlayer: (patch) => set((state) => ({ player: { ...state.player, ...patch } })),
});
