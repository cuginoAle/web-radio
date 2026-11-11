import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, radius, spacing, TOUCH_TARGET } from '@/theme/tokens';

export const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: TOUCH_TARGET,
    paddingLeft: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: { flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: fontSizes.subtitle },
});
