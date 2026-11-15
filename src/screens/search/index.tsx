import { View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Logo } from '@/components/Logo';
import { StationList } from '@/components/StationList';
import { listStationUuids } from '@/db/queries/stations';
import { useStationList } from '@/hooks/stations/useStationList';
import { useTags } from '@/hooks/stations/useTags';
import { SearchField } from '@/screens/search/SearchField';
import { styles } from '@/screens/search/styles';
import { TagChips } from '@/screens/search/TagChips';
import { getRuntime } from '@/services/runtime';
import { useGlobalState } from '@/state/global-state';

const TOP_TAGS = 12;

export function SearchScreen() {
  const query = useGlobalState((s) => s.searchQuery);
  const selectedTag = useGlobalState((s) => s.selectedTag);
  const setSearchQuery = useGlobalState((s) => s.setSearchQuery);
  const setSelectedTag = useGlobalState((s) => s.setSelectedTag);
  const tags = useTags(TOP_TAGS);
  const list = useStationList({ query, tag: selectedTag?.key });

  const loadUuids = () => listStationUuids(getRuntime().db, { query, tag: selectedTag?.key });

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Logo />
        <SearchField value={query} onChange={setSearchQuery} />
        <TagChips tags={tags} selected={selectedTag} onSelect={setSelectedTag} />
      </View>
      {list.status === 'error' ? (
        <EmptyState title="Database error" message="The catalogue could not be read." actionLabel="Retry" onAction={list.retry} />
      ) : (
        <StationList
          items={list.items}
          rowOptions={() => ({ loadUuids })}
          onEndReached={list.loadMore}
          empty={list.status === 'ready' ? <EmptyState title="No stations found" /> : null}
        />
      )}
    </View>
  );
}
