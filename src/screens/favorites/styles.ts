import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { gap: spacing.xs, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  count: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSizes.body },
});
