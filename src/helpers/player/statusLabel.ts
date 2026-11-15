import type { PlayerStatus } from '@/state/slices/player';

const LABELS: Record<PlayerStatus, string> = {
  idle: '',
  loading: 'Loading…',
  playing: 'Live radio',
  paused: 'Paused',
  buffering: 'Reconnecting…',
  error: 'Playback error',
};

export const statusLabel = (status: PlayerStatus) => LABELS[status];
