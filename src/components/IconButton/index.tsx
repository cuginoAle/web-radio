import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable } from 'react-native';

import { styles } from '@/components/IconButton/styles';
import { colors } from '@/theme/tokens';

type Props = {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  color?: string;
  size?: number;
  disabled?: boolean;
  variant?: 'plain' | 'filled';
  selected?: boolean;
};

export function IconButton({ icon, label, onPress, color, size = 24, disabled, variant = 'plain', selected }: Props) {
  const tint = variant === 'filled' ? colors.onAccent : (color ?? colors.text);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, selected: !!selected }}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      style={[styles.button, variant === 'filled' && styles.filled, disabled && styles.disabled]}
    >
      <Ionicons name={icon} size={size} color={tint} />
    </Pressable>
  );
}
