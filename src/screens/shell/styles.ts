import { StyleSheet } from 'react-native';

import { colors } from '@/theme/tokens';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  hidden: { display: 'none' },
  row: { flex: 1, flexDirection: 'row' },
  column: { flex: 1, flexDirection: 'column' },
  main: { flex: 1 },
  body: { flex: 1, flexDirection: 'row' },
  content: { flex: 1 },
  panel: { width: '33%', borderLeftWidth: 1, borderLeftColor: colors.border },
});
