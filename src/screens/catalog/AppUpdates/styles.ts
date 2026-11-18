import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, radius, spacing, TOUCH_TARGET } from '@/theme/tokens';

export const styles = StyleSheet.create({
  root: { gap: spacing.lg },
  heading: { color: colors.text, fontFamily: fonts.title, fontSize: fontSizes.title },
  text: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSizes.body, lineHeight: 22 },
  row: { minHeight: TOUCH_TARGET, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  label: { color: colors.text, fontFamily: fonts.medium, fontSize: fontSizes.body },
  button: {
    minHeight: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  disabled: { opacity: 0.5 },
  buttonLabel: { color: colors.accent, fontFamily: fonts.semibold, fontSize: fontSizes.body },
  error: { color: colors.warning, fontFamily: fonts.body, fontSize: fontSizes.body },
});
