import type { AudioSession } from '@/services/audio/createAudioSession';
import type { StationSnapshot } from '@/services/audio/types';

/** GLOSSARY: Autostart. Prefers the active catalogue's copy (fresh stream URL), else the stored one. */
export async function autostart(
  audio: Pick<AudioSession, 'play'>,
  last: StationSnapshot | null,
  resolveStation: (uuid: string) => Promise<StationSnapshot | null>,
) {
  if (!last) return;
  const station = (await resolveStation(last.uuid).catch(() => null)) ?? last;
  audio.play(station, { uuids: [last.uuid], index: 0 }); // the original source list isn't kept
}
