import { StationRow } from '@/components/StationRow';
import type { StationItem } from '@/db/queries/stations';
import { stationSubtitle } from '@/helpers/player/toSnapshot';
import { useStationRow } from '@/hooks/player/useStationRow';

type Props = {
  station: StationItem;
  /** The uuids of the list this row belongs to, frozen when listening starts. */
  loadUuids: () => Promise<string[]>;
  warning?: string;
  playLabel?: string;
};

const CHECK_FAILED = 'Last check failed';

export function StationRowContainer({ station, loadUuids, warning, playLabel }: Props) {
  const row = useStationRow(station, loadUuids);
  return (
    <StationRow
      name={station.name}
      subtitle={stationSubtitle(station)}
      favicon={station.favicon}
      warning={warning ?? (station.lastCheckOk ? null : CHECK_FAILED)}
      playback={row.playback}
      isFavorite={row.isFavorite}
      playLabel={playLabel}
      onPlay={row.onPlay}
      onToggleFavorite={row.onToggleFavorite}
    />
  );
}
