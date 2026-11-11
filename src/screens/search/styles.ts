import { StyleSheet } from 'react-native';

import { spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { gap: spacing.md, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
});
