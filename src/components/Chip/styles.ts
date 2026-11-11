import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, radius, spacing, TOUCH_TARGET } from '@/theme/tokens';

export const styles = StyleSheet.create({
  chip: {
    minHeight: TOUCH_TARGET,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.accent, borderColor: colors.accent },
  label: { color: colors.text, fontFamily: fonts.medium, fontSize: fontSizes.body },
  selectedLabel: { color: colors.onAccent },
});
