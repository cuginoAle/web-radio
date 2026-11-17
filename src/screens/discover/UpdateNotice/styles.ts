import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, radius, spacing, TOUCH_TARGET } from '@/theme/tokens';

const button = {
  minHeight: TOUCH_TARGET,
  justifyContent: 'center',
  paddingHorizontal: spacing.xl,
  borderRadius: radius.pill,
} as const;

export const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  text: { color: colors.text, fontFamily: fonts.body, fontSize: fontSizes.body, lineHeight: 22 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
  primary: { ...button, backgroundColor: colors.accent },
  primaryLabel: { color: colors.onAccent, fontFamily: fonts.semibold, fontSize: fontSizes.body },
  secondary: button,
  secondaryLabel: { color: colors.accent, fontFamily: fonts.medium, fontSize: fontSizes.body },
});
