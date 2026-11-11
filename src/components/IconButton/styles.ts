import { StyleSheet } from 'react-native';

import { colors, radius, TOUCH_TARGET } from '@/theme/tokens';

export const styles = StyleSheet.create({
  button: {
    minWidth: TOUCH_TARGET,
    minHeight: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  filled: { backgroundColor: colors.accent },
  disabled: { opacity: 0.35 },
});
