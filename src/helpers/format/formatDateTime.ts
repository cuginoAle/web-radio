export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('it-IT', { dateStyle: 'medium', timeStyle: 'short' });
