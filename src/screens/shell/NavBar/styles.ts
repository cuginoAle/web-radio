import { StyleSheet } from 'react-native';

import { colors, spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  bottom: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: spacing.xs },
  rail: {
    width: 96,
    paddingVertical: spacing.lg,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  // Takes the space between clock and back button, so the tabs sit centred in it.
  railItems: { flex: 1, justifyContent: 'center', gap: spacing.sm },
});
