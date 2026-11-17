import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  root: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  song: { color: colors.accent, fontFamily: fonts.medium, fontSize: fontSizes.body, textAlign: 'right' },
});
