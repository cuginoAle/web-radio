import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.sm },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: fontSizes.title },
});
