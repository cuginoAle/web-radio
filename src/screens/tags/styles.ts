import { StyleSheet } from 'react-native';

import { colors, spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  list: { gap: spacing.sm, padding: spacing.lg },
});
