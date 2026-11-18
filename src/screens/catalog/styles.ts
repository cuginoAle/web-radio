import { StyleSheet } from 'react-native';

import { colors, spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { gap: spacing.lg, padding: spacing.xl, maxWidth: 560 },
  wide: { flexDirection: 'row', gap: spacing.xl, padding: spacing.xl },
  primary: { flex: 3 },
  secondary: { flex: 2 },
  divided: { paddingTop: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border },
});
