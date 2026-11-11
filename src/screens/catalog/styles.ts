import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, radius, spacing, TOUCH_TARGET } from '@/theme/tokens';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { gap: spacing.lg, padding: spacing.xl, maxWidth: 560 },
  count: { color: colors.text, fontFamily: fonts.title, fontSize: fontSizes.title },
  text: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSizes.body, lineHeight: 22 },
  progress: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  confirm: { color: colors.accent, fontFamily: fonts.medium, fontSize: fontSizes.body },
  error: { color: colors.warning, fontFamily: fonts.body, fontSize: fontSizes.body },
  button: {
    minHeight: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.accent },
  label: { color: colors.onAccent, fontFamily: fonts.semibold, fontSize: fontSizes.body },
  secondaryLabel: { color: colors.accent },
});
