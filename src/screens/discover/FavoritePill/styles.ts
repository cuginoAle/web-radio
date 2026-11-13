import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, radius, spacing, TOUCH_TARGET } from '@/theme/tokens';

// Same footprint as TagTile, so the two grids line up.
export const styles = StyleSheet.create({
  pill: {
    flexBasis: 140,
    flexGrow: 1,
    minHeight: TOUCH_TARGET + 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { flex: 1, color: colors.text, fontFamily: fonts.title, fontSize: fontSizes.subtitle },
});
