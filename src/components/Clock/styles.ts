import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, radius, spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  pill: {
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  label: { color: colors.text, fontFamily: fonts.semibold, fontSize: fontSizes.body, fontVariant: ['tabular-nums'] },
});
