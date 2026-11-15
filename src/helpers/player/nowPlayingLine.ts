import type { PlayerState } from '@/state/slices/player';

/** The Now playing worth showing: only while audible, so a paused or failing station never shows a stale song. */
export const nowPlayingLine = ({ status, nowPlaying }: PlayerState) => (status === 'playing' ? nowPlaying : null);
