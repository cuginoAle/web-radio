import { StyleSheet } from 'react-native';

import { colors, TOUCH_TARGET } from '@/theme/tokens';

export const styles = StyleSheet.create({
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: TOUCH_TARGET + 8 },
  // Height the item had with its label (measured), so the rail keeps its rhythm. Right border mirrors the accent one to centre the icon.
  railItem: { flex: 0, height: 62, borderLeftWidth: 3, borderRightWidth: 3, borderColor: 'transparent' },
  railItemActive: { borderLeftColor: colors.accent, backgroundColor: colors.accentSoft },
});
