import { EmptyState } from '@/components/EmptyState';
import { StationList } from '@/components/StationList';
import { listStationUuids } from '@/db/queries/stations';
import { useStationList } from '@/hooks/stations/useStationList';
import { openTag } from '@/hooks/stations/useOpenTag';
import { useTags } from '@/hooks/stations/useTags';
import { DiscoverHeader } from '@/screens/discover/DiscoverHeader';
import { getRuntime } from '@/services/runtime';

const TOP_TAGS = 12;

const loadAllUuids = () => listStationUuids(getRuntime().db, {});

export function DiscoverScreen() {
  const tags = useTags(TOP_TAGS);
  const list = useStationList({});

  return (
    <StationList
      items={list.items}
      rowOptions={() => ({ loadUuids: loadAllUuids })}
      onEndReached={list.loadMore}
      header={<DiscoverHeader tags={tags} onOpenTag={openTag} />}
      empty={list.status === 'error' ? <EmptyState title="Errore del database" actionLabel="Riprova" onAction={list.retry} /> : null}
    />
  );
}
