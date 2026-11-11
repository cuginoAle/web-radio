import { StyleSheet } from 'react-native';

import { colors, radius } from '@/theme/tokens';

export const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  image: { ...StyleSheet.absoluteFill },
});
