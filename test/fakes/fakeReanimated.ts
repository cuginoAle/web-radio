import { useState } from 'react';
import { View } from 'react-native';

// Stands in for Reanimated, whose own Jest mode needs react-native-web (not installed: Android only).
// Shared values are plain boxes and styles are computed on render: enough to see what is drawn, not how it moves.
export const useSharedValue = <T>(initial: T) =>
  useState(() => {
    let value = initial;
    return { get: () => value, set: (next: T) => void (value = next) };
  })[0];
export const useAnimatedStyle = <T>(style: () => T) => style();
export const withTiming = <T>(value: T) => value;
export const Easing = { linear: (t: number) => t };
/** Android's "Remove animations" setting. */
export const useReducedMotion = jest.fn(() => false);

export default { View };
