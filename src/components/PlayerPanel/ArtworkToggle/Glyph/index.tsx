import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Animated } from 'react-native';

import { styles } from '@/components/PlayerPanel/ArtworkToggle/Glyph/styles';
import type { Glyph as GlyphKind } from '@/helpers/player/glyphFor';
import { useSpin } from '@/hooks/player/useSpin';
import { colors } from '@/theme/tokens';

const PAINT = { fill: colors.accent, fillOpacity: 0.7, stroke: '#FFFFFF', strokeWidth: 3, strokeLinejoin: 'round' } as const;

// 270° ring with flat ends, drawn as a filled shape so it gets the same white outline.
const RING = 'M50 10 A40 40 0 1 1 10 50 L24 50 A26 26 0 1 0 50 24 Z';

type Props = {
  kind: GlyphKind;
  size: number;
};

export function Glyph({ kind, size }: Props) {
  const spin = useSpin(kind === 'loading');
  return (
    <Animated.View testID={`glyph-${kind}`} style={[styles.shadow, { width: size, height: size, transform: spin }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {kind === 'pause' ? (
          <>
            <Rect x={22} y={14} width={20} height={72} rx={6} {...PAINT} />
            <Rect x={58} y={14} width={20} height={72} rx={6} {...PAINT} />
          </>
        ) : null}
        {kind === 'play' ? <Path d="M28 14 L86 50 L28 86 Z" {...PAINT} /> : null}
        {kind === 'loading' ? <Path d={RING} {...PAINT} /> : null}
        {kind === 'error' ? (
          <>
            <Rect x={40} y={10} width={20} height={56} rx={8} {...PAINT} />
            <Circle cx={50} cy={82} r={10} {...PAINT} />
          </>
        ) : null}
      </Svg>
    </Animated.View>
  );
}
