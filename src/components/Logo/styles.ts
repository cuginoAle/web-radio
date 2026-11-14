import { StyleSheet } from 'react-native';

import { TOUCH_TARGET } from '@/theme/tokens';

export const styles = StyleSheet.create({
  // Same height as Discover's brand row (logo + info button): the logo stays put when switching tabs.
  root: { minHeight: TOUCH_TARGET, justifyContent: 'center' },
  // 841×142 px asset: sharp at 34 dp up to density ~4.
  logo: { height: 34, aspectRatio: 841 / 142 },
});
