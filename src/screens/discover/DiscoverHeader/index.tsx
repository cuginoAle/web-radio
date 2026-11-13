import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { IconButton } from '@/components/IconButton';
import { Logo } from '@/components/Logo';
import { TagTile } from '@/components/TagTile';
import type { FavoriteItem } from '@/db/queries/favorites';
import type { TagGroup } from '@/db/queries/stations';
import { pairs } from '@/helpers/layout/pairs';
import { styles } from '@/screens/discover/DiscoverHeader/styles';
import { FavoritePill } from '@/screens/discover/FavoritePill';

type Props = {
  tags: TagGroup[];
  onOpenTag: (tag: TagGroup) => void;
  topFavorites: FavoriteItem[];
  onPlayFavorite: (station: FavoriteItem) => void;
};

export function DiscoverHeader({ tags, onOpenTag, topFavorites, onPlayFavorite }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.brandRow}>
        <Logo />
        <IconButton icon="information-circle-outline" label="Catalogo radio" onPress={() => router.push('/catalog')} />
      </View>
      {topFavorites.length > 0 ? (
        <>
          <Text style={styles.section} accessibilityRole="header">
            I più ascoltati
          </Text>
          {/* Explicit rows, not wrap + % flexBasis: Yoga keeps a stale % basis after rotation. */}
          <View style={styles.pillRows}>
            {pairs(topFavorites).map((row) => (
              <View key={row[0].uuid} style={styles.pillRow}>
                {row.map((station) => (
                  <FavoritePill key={station.uuid} name={station.name} favicon={station.favicon} onPress={() => onPlayFavorite(station)} />
                ))}
                {row.length === 1 ? <View style={styles.pillSpacer} /> : null}
              </View>
            ))}
          </View>
        </>
      ) : null}
      <View style={styles.sectionRow}>
        <Text style={styles.section} accessibilityRole="header">
          Generi e tag
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Vedi tutti i tag" onPress={() => router.push('/tags')} style={styles.link}>
          <Text style={styles.linkLabel}>Vedi tutti</Text>
        </Pressable>
      </View>
      <View style={styles.grid}>
        {tags.map((tag) => (
          <TagTile key={tag.key} label={tag.label} count={tag.count} onPress={() => onOpenTag(tag)} />
        ))}
      </View>
    </View>
  );
}
