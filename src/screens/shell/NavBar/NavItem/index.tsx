import Ionicons from '@expo/vector-icons/Ionicons';
import type { TabTriggerSlotProps } from 'expo-router/ui';
import type { ComponentProps } from 'react';
import { Pressable } from 'react-native';

import { styles } from '@/screens/shell/NavBar/NavItem/styles';
import { colors } from '@/theme/tokens';

export type IconName = ComponentProps<typeof Ionicons>['name'];

type Props = Omit<TabTriggerSlotProps, 'ref'> & {
  label: string;
  icon: IconName;
  activeIcon: IconName;
  rail: boolean;
};

/** Receives press handlers and `isFocused` from its TabTrigger. */
export function NavItem({ label, icon, activeIcon, rail, isFocused, ...props }: Props) {
  const tint = isFocused ? colors.accent : colors.textMuted;
  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!isFocused }}
      style={[styles.item, rail && styles.railItem, rail && isFocused && styles.railItemActive]}
    >
      <Ionicons name={isFocused ? activeIcon : icon} size={24} color={tint} />
    </Pressable>
  );
}
