import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, spacing, TOUCH_TARGET } from '@/theme/tokens';

export const styles = StyleSheet.create({
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, minHeight: TOUCH_TARGET + 8 },
  railItem: { flex: 0, borderLeftWidth: 3, borderLeftColor: 'transparent', paddingVertical: spacing.sm },
  railItemActive: { borderLeftColor: colors.accent },
  label: { fontFamily: fonts.medium, fontSize: fontSizes.caption },
});
