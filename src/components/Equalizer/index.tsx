import { useEffect, useState } from 'react';
import { Animated, Easing, View } from 'react-native';

import { styles } from '@/components/Equalizer/styles';

const DURATIONS = [420, 560, 360, 500];

/** Decorative "on air" sign, not an audio analysis; only rendered while the stream really plays. */
export function Equalizer() {
  const [bars] = useState(() => DURATIONS.map(() => new Animated.Value(0.3)));

  useEffect(() => {
    const loops = bars.map((bar, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(bar, { toValue: 1, duration: DURATIONS[i], easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(bar, { toValue: 0.3, duration: DURATIONS[i], easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [bars]);

  return (
    <View style={styles.row} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {bars.map((bar, i) => (
        <Animated.View key={DURATIONS[i]} style={[styles.bar, { transform: [{ scaleY: bar }] }]} />
      ))}
    </View>
  );
}
