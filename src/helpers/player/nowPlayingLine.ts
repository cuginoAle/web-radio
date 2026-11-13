import type { PlayerState } from '@/state/slices/player';

/** The Brano in onda worth showing: only while audible, so a paused or failing station never shows a stale song. */
export const nowPlayingLine = ({ status, nowPlaying }: PlayerState) => (status === 'playing' ? nowPlaying : null);
