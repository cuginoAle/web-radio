import { useEffect, useState } from 'react';
import { Animated } from 'react-native';

import type { Glyph } from '@/helpers/player/glyphFor';

const HOLD_MS = 3000;
const FADE_MS = 400;

/** Each new glyph shows fully; play and pause then fade out, loading and errors stay until the status moves on. */
export function useGlyphFade(glyph: Glyph) {
  const [opacity] = useState(() => new Animated.Value(1));
  const [faded, setFaded] = useState<Glyph | null>(null);

  useEffect(() => {
    opacity.setValue(1);
    if (glyph === 'loading' || glyph === 'error') return;
    const fade = Animated.timing(opacity, { toValue: 0, delay: HOLD_MS, duration: FADE_MS, useNativeDriver: true });
    fade.start(({ finished }) => finished && setFaded(glyph));
    return () => fade.stop();
  }, [glyph, opacity]);

  return { opacity, shown: faded !== glyph };
}
