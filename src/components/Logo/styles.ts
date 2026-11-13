import { StyleSheet } from 'react-native';

import { TOUCH_TARGET } from '@/theme/tokens';

export const styles = StyleSheet.create({
  // Same height as Discover's brand row (logo + info button): the logo stays put when switching tabs.
  root: { minHeight: TOUCH_TARGET, justifyContent: 'center' },
  // 292×44 px asset: ~1:1 with the pixels of the tablet in the mock (density ~2.6).
  logo: { height: 17, aspectRatio: 292 / 44 },
});
