import { router } from 'expo-router';
import { View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ScreenTitle } from '@/components/ScreenTitle';
import { StationList } from '@/components/StationList';
import type { FavoriteItem } from '@/db/queries/favorites';
import { useFavoriteList } from '@/hooks/favorites/useFavoriteList';
import { styles } from '@/screens/favorites/styles';

const countLabel = (n: number) => (n === 1 ? '1 preferito' : `${n} preferiti`);

export function FavoritesScreen() {
  const { items, status, retry } = useFavoriteList();

  const rowOptions = (item: FavoriteItem) =>
    item.inCatalog
      ? { loadUuids: async () => items.filter((f) => f.inCatalog).map((f) => f.uuid) }
      : {
          // Absence from the directory does not prove the stream is dead: the last URL can still be tried.
          loadUuids: async () => [item.uuid],
          warning: 'Non presente nel catalogo aggiornato · Prova comunque',
          playLabel: 'Prova comunque',
        };

  const empty =
    status === 'ready' ? (
      <EmptyState
        title="Nessun preferito"
        message="Tocca il cuore su una radio per ritrovarla qui."
        actionLabel="Vai a Scopri"
        onAction={() => router.navigate('/')}
      />
    ) : null;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <ScreenTitle title="Le tue radio" subtitle={items.length > 0 ? countLabel(items.length) : undefined} />
      </View>
      {status === 'error' ? (
        <EmptyState title="Errore del database" actionLabel="Riprova" onAction={retry} />
      ) : (
        <StationList items={items} rowOptions={rowOptions} empty={empty} />
      )}
    </View>
  );
}
