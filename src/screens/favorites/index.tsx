import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Logo } from '@/components/Logo';
import { StationList } from '@/components/StationList';
import type { FavoriteItem } from '@/db/queries/favorites';
import { useFavoriteList } from '@/hooks/favorites/useFavoriteList';
import { styles } from '@/screens/favorites/styles';

const countLabel = (n: number) => (n === 1 ? '1 favourite' : `${n} favourites`);

export function FavoritesScreen() {
  const { items, status, retry } = useFavoriteList();

  const rowOptions = (item: FavoriteItem) =>
    item.inCatalog
      ? { loadUuids: async () => items.filter((f) => f.inCatalog).map((f) => f.uuid) }
      : {
          // Absence from the directory does not prove the stream is dead: the last URL can still be tried.
          loadUuids: async () => [item.uuid],
          warning: 'Not in the updated catalogue · Try anyway',
          playLabel: 'Try anyway',
        };

  const empty =
    status === 'ready' ? (
      <EmptyState
        title="No favourites yet"
        message="Tap the heart on a station to find it here again."
        actionLabel="Go to Discover"
        onAction={() => router.navigate('/')}
      />
    ) : null;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Logo />
        {items.length > 0 ? <Text style={styles.count}>{countLabel(items.length)}</Text> : null}
      </View>
      {status === 'error' ? (
        <EmptyState title="Database error" actionLabel="Retry" onAction={retry} />
      ) : (
        <StationList items={items} rowOptions={rowOptions} empty={empty} />
      )}
    </View>
  );
}
