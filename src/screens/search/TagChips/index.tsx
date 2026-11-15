import { ScrollView } from 'react-native';

import { Chip } from '@/components/Chip';
import type { TagGroup } from '@/db/queries/stations';
import { styles } from '@/screens/search/TagChips/styles';
import type { SelectedTag } from '@/state/slices/browse';

type Props = {
  tags: TagGroup[];
  selected: SelectedTag | null;
  onSelect: (tag: SelectedTag | null) => void;
};

export function TagChips({ tags, selected, onSelect }: Props) {
  const showsSelected = !selected || tags.some((tag) => tag.key === selected.key);
  const chips: SelectedTag[] = showsSelected || !selected ? tags : [selected, ...tags];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.row}>
      <Chip label="All" selected={!selected} onPress={() => onSelect(null)} />
      {chips.map((tag) => (
        <Chip key={tag.key} label={tag.label} selected={tag.key === selected?.key} onPress={() => onSelect(tag)} />
      ))}
    </ScrollView>
  );
}
