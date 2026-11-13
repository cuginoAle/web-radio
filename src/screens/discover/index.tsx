import { ScrollView } from 'react-native';

import type { FavoriteItem } from '@/db/queries/favorites';
import { useTopFavorites } from '@/hooks/favorites/useTopFavorites';
import { openTag } from '@/hooks/stations/useOpenTag';
import { useTags } from '@/hooks/stations/useTags';
import { DiscoverHeader } from '@/screens/discover/DiscoverHeader';
import { styles } from '@/screens/discover/styles';
import { playFromList } from '@/services/audio/playFromList';

const TOP_TAGS = 12;

export function DiscoverScreen() {
  const tags = useTags(TOP_TAGS);
  const topFavorites = useTopFavorites();

  // Previous / next move among the pills (GLOSSARY: Elenco di origine).
  const play = (station: FavoriteItem) => void playFromList(station, async () => topFavorites.map((f) => f.uuid));

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <DiscoverHeader tags={tags} onOpenTag={openTag} topFavorites={topFavorites} onPlayFavorite={play} />
    </ScrollView>
  );
}
