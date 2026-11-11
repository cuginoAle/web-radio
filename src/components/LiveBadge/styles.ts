import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, radius, spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.sm,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  label: { color: colors.accent, fontFamily: fonts.semibold, fontSize: fontSizes.caption },
});
