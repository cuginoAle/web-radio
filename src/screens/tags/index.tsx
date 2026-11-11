import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModalHeader } from '@/components/ModalHeader';
import { TagTile } from '@/components/TagTile';
import { openTag } from '@/hooks/stations/useOpenTag';
import { useTags } from '@/hooks/stations/useTags';
import { styles } from '@/screens/tags/styles';

export function TagsScreen() {
  const tags = useTags();
  return (
    <SafeAreaView style={styles.root}>
      <ModalHeader title="Generi e tag" />
      <FlatList
        data={tags}
        keyExtractor={(tag) => tag.key}
        renderItem={({ item }) => <TagTile label={item.label} count={item.count} onPress={() => openTag(item)} />}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}
