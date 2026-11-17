import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes } from '@/theme/tokens';

// The digits are stretched to twice their height; a transform does not move the layout, so the same
// height is reserved below the label.
const scaleY = 1.5;

export const styles = StyleSheet.create({
  pill: {
    alignSelf: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  label: {
    color: colors.accent,
    fontFamily: fonts.body,
    fontSize: fontSizes.clock,
    fontVariant: ['tabular-nums'],
    lineHeight: fontSizes.clock * scaleY,
    transform: [{ scaleY }],
    transformOrigin: 'top',
  },
  period: {
    margin: 'auto',
    color: colors.textMuted,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.caption,
    fontVariant: ['tabular-nums'],
  },
});
