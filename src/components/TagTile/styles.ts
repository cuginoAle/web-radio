import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, radius, spacing, TOUCH_TARGET } from '@/theme/tokens';

export const styles = StyleSheet.create({
  tile: {
    flexBasis: 140,
    flexGrow: 1,
    minHeight: TOUCH_TARGET + 16,
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { color: colors.text, fontFamily: fonts.title, fontSize: fontSizes.subtitle },
  count: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSizes.caption },
});
