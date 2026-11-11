import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { IconButton } from '@/components/IconButton';
import { ScreenTitle } from '@/components/ScreenTitle';
import { TagTile } from '@/components/TagTile';
import type { TagGroup } from '@/db/queries/stations';
import { useIsWideLayout } from '@/hooks/layout/useIsWideLayout';
import { styles } from '@/screens/discover/DiscoverHeader/styles';

type Props = {
  tags: TagGroup[];
  onOpenTag: (tag: TagGroup) => void;
};

export function DiscoverHeader({ tags, onOpenTag }: Props) {
  const isWide = useIsWideLayout();
  return (
    <View style={styles.root}>
      <View style={styles.brandRow}>
        {isWide ? <View /> : <Text style={styles.brand}>RADIO</Text>}
        <IconButton icon="information-circle-outline" label="Catalogo radio" onPress={() => router.push('/catalog')} />
      </View>
      <ScreenTitle title="La tua frequenza." subtitle="Il suono giusto, adesso." />
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
      <Text style={styles.section} accessibilityRole="header">
        Tutte le radio
      </Text>
    </View>
  );
}
