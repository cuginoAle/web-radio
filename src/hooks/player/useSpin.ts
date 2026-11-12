import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

/** A rotation that loops while `active`, as a transform for an Animated.View. */
export function useSpin(active: boolean) {
  const [turn] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(Animated.timing(turn, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => {
      loop.stop();
      turn.setValue(0);
    };
  }, [active, turn]);

  return [{ rotate: turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }];
}
