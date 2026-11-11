import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  bottom: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: spacing.xs },
  rail: { width: 96, gap: spacing.sm, paddingTop: spacing.lg, borderRightWidth: 1, borderRightColor: colors.border },
  brand: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.caption,
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
