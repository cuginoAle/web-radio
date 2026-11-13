import { StyleSheet } from 'react-native';

import { colors, spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  bottom: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: spacing.xs },
  rail: {
    width: 96,
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  railItems: { gap: spacing.sm },
});
