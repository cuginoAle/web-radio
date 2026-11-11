import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, radius, spacing, TOUCH_TARGET } from '@/theme/tokens';

export const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', backgroundColor: colors.background },
  content: { gap: spacing.xl, padding: spacing.xl, maxWidth: 560, alignSelf: 'center' },
  text: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSizes.body, lineHeight: 22 },
  progress: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  count: { color: colors.text, fontFamily: fonts.medium, fontSize: fontSizes.subtitle },
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
