import { Pressable, Text } from 'react-native';

import { styles } from '@/components/Chip/styles';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function Chip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}
