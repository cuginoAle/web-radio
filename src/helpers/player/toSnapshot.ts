import type { StationItem } from '@/db/queries/stations';
import { pickStreamUrl } from '@/helpers/player/pickStreamUrl';
import type { StationSnapshot } from '@/services/audio/types';

export const stationSubtitle = ({ firstTag, country }: Pick<StationItem, 'firstTag' | 'country'>) =>
  [firstTag, country].filter(Boolean).join(' · ');

export const toSnapshot = (station: StationItem): StationSnapshot => ({
  uuid: station.uuid,
  name: station.name,
  streamUrl: pickStreamUrl(station) ?? '',
  favicon: station.favicon,
  subtitle: stationSubtitle(station),
});
