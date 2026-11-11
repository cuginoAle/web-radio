import type { ReactElement } from 'react';
import { FlatList } from 'react-native';

import { styles } from '@/components/StationList/styles';
import { StationRowContainer } from '@/components/StationRowContainer';
import type { StationItem } from '@/db/queries/stations';

type RowOptions = {
  loadUuids: () => Promise<string[]>;
  warning?: string;
  playLabel?: string;
};

type Props<T extends StationItem> = {
  items: T[];
  rowOptions: (item: T) => RowOptions;
  onEndReached?: () => void;
  header?: ReactElement;
  empty?: ReactElement | null;
};

// Virtualized and paged locally: the full catalog is never mounted.
export function StationList<T extends StationItem>({ items, rowOptions, onEndReached, header, empty }: Props<T>) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.uuid}
      renderItem={({ item }) => <StationRowContainer station={item} {...rowOptions(item)} />}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      initialNumToRender={12}
      windowSize={7}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={header}
      ListEmptyComponent={empty ?? undefined}
      contentContainerStyle={styles.content}
    />
  );
}
