import { Pressable, Text } from 'react-native';

import { styles } from '@/components/TagTile/styles';
import { formatStationCount } from '@/helpers/format/formatStationCount';

type Props = {
  label: string;
  count: number;
  onPress: () => void;
};

export function TagTile({ label, count, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${formatStationCount(count)}`}
      onPress={onPress}
      style={styles.tile}
    >
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.count}>{count}</Text>
    </Pressable>
  );
}
