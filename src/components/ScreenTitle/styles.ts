import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  root: { gap: spacing.xs },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: fontSizes.display },
  subtitle: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSizes.body },
});
