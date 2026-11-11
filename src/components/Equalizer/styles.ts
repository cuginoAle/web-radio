import { StyleSheet } from 'react-native';

import { colors } from '@/theme/tokens';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2, height: 18 },
  bar: { width: 3, height: 18, borderRadius: 1.5, backgroundColor: colors.accent },
});
