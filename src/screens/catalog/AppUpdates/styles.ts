import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, spacing, TOUCH_TARGET } from '@/theme/tokens';

export const styles = StyleSheet.create({
  root: { gap: spacing.lg, paddingTop: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border },
  heading: { color: colors.text, fontFamily: fonts.title, fontSize: fontSizes.title },
  text: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSizes.body, lineHeight: 22 },
  row: { minHeight: TOUCH_TARGET, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  label: { color: colors.text, fontFamily: fonts.medium, fontSize: fontSizes.body },
});
