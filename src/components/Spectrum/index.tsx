import { View } from 'react-native';

import { Bar } from '@/components/Spectrum/Bar';
import { styles } from '@/components/Spectrum/styles';
import { useSpectrum } from '@/hooks/player/useSpectrum';

const BANDS = Array.from({ length: 20 }, (_, band) => band);

/** The Spectrum as a backdrop along the bottom edge of its parent; render it first so the content sits on top. */
export function Spectrum() {
  const levels = useSpectrum();
  if (!levels) return null;

  return (
    <View
      testID="spectrum"
      style={styles.root}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {BANDS.map((band) => (
        <Bar key={band} band={band} levels={levels} />
      ))}
    </View>
  );
}
