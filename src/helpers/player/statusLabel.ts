import type { PlayerStatus } from '@/state/slices/player';

const LABELS: Record<PlayerStatus, string> = {
  idle: '',
  loading: 'Caricamento…',
  playing: 'Radio in diretta',
  paused: 'In pausa',
  buffering: 'Riconnessione in corso…',
  error: 'Errore di riproduzione',
};

export const statusLabel = (status: PlayerStatus) => LABELS[status];
