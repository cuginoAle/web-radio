import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, radius, spacing, TOUCH_TARGET } from '@/theme/tokens';

export const styles = StyleSheet.create({
  frame: { flex: 1 },
  root: { alignItems: 'center', gap: spacing.xl, padding: spacing.xl },
  prompt: {
    margin: spacing.xl,
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSizes.subtitle,
    textAlign: 'center',
  },
  heading: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', gap: spacing.sm },
  titles: { flex: 1, gap: spacing.xs },
  name: { color: colors.text, fontFamily: fonts.title, fontSize: fontSizes.title },
  subtitle: { color: colors.textMuted, fontFamily: fonts.body, fontSize: fontSizes.body },
  nowPlaying: { color: colors.accent, fontFamily: fonts.medium, fontSize: fontSizes.body },
  status: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', gap: spacing.sm, minHeight: 24 },
  statusLabel: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: fontSizes.body },
  errorBox: { alignSelf: 'stretch', alignItems: 'center', gap: spacing.md },
  error: { color: colors.warning, fontFamily: fonts.body, fontSize: fontSizes.body, textAlign: 'center' },
  retry: {
    minHeight: TOUCH_TARGET,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  retryLabel: { color: colors.accent, fontFamily: fonts.semibold, fontSize: fontSizes.body },
});
