import type { PlayerStatus } from '@/state/slices/player';

export type Glyph = 'pause' | 'play' | 'loading' | 'error';

// Like the play button, the glyph shows what a tap will do; loading and errors get their own sign.
const GLYPHS: Record<PlayerStatus, Glyph> = {
  idle: 'play',
  loading: 'loading',
  playing: 'pause',
  paused: 'play',
  buffering: 'loading',
  error: 'error',
};

export const glyphFor = (status: PlayerStatus) => GLYPHS[status];
