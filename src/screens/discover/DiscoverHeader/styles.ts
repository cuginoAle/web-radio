import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, spacing, TOUCH_TARGET } from '@/theme/tokens';

export const styles = StyleSheet.create({
  root: { gap: spacing.md, paddingHorizontal: spacing.sm, paddingBottom: spacing.sm },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { color: colors.text, fontFamily: fonts.semibold, fontSize: fontSizes.caption, letterSpacing: 4 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  section: { color: colors.text, fontFamily: fonts.semibold, fontSize: fontSizes.subtitle },
  link: { minHeight: TOUCH_TARGET, justifyContent: 'center' },
  linkLabel: { color: colors.accent, fontFamily: fonts.medium, fontSize: fontSizes.body },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
