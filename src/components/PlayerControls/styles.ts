import { StyleSheet } from 'react-native';

import { spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  main: { transform: [{ scale: 1.5 }], marginHorizontal: spacing.md },
});
