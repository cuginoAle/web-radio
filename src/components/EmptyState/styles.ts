import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, radius, spacing, TOUCH_TARGET } from '@/theme/tokens';

export const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.md },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: fontSizes.title, textAlign: 'center' },
  message: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSizes.body, textAlign: 'center' },
  action: {
    minHeight: TOUCH_TARGET,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  actionLabel: { color: colors.onAccent, fontFamily: fonts.semibold, fontSize: fontSizes.body },
});
