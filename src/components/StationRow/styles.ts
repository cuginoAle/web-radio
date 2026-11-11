import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, radius, spacing, TOUCH_TARGET } from '@/theme/tokens';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  current: { backgroundColor: colors.surface },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: TOUCH_TARGET },
  texts: { flex: 1, gap: 2 },
  name: { color: colors.text, fontFamily: fonts.medium, fontSize: fontSizes.body },
  subtitle: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSizes.caption },
  warning: { color: colors.warning, fontFamily: fonts.body, fontSize: fontSizes.caption },
});
