import Animated, { Easing, type SharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { styles } from '@/components/Spectrum/Bar/styles';

// A little longer than the gap between two measurements (~46 ms), so the bar never stops in between.
const GLIDE = { duration: 60, easing: Easing.linear };

type Props = {
  band: number;
  levels: SharedValue<number[]>;
};

export function Bar({ band, levels }: Props) {
  const height = useAnimatedStyle(() => ({
    transform: [{ scaleY: withTiming(levels.get()[band] ?? 0, GLIDE) }],
  }));

  return <Animated.View style={[styles.bar, height]} />;
}
