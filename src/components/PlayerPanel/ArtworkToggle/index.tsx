import { Animated, Pressable } from 'react-native';

import { Glyph } from '@/components/PlayerPanel/ArtworkToggle/Glyph';
import { styles } from '@/components/PlayerPanel/ArtworkToggle/styles';
import { StationArtwork } from '@/components/StationArtwork';
import { glyphFor, type Glyph as GlyphKind } from '@/helpers/player/glyphFor';
import { useGlyphFade } from '@/hooks/player/useGlyphFade';
import type { PlayerStatus } from '@/state/slices/player';

const LABELS: Record<GlyphKind, string> = {
  pause: 'Pause',
  loading: 'Pause',
  play: 'Resume',
  error: 'Retry',
};

type Props = {
  favicon: string | null;
  size: number;
  status: PlayerStatus;
  onPress: () => void;
};

/** The side panel's only playback control: the artwork itself, with a glyph for what a tap does. */
export function ArtworkToggle({ favicon, size, status, onPress }: Props) {
  const glyph = glyphFor(status);
  const { opacity, shown } = useGlyphFade(glyph);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={LABELS[glyph]} onPress={onPress}>
      <StationArtwork favicon={favicon} size={size} />
      <Animated.View style={[styles.overlay, { opacity }]} pointerEvents="none">
        {shown ? <Glyph kind={glyph} size={size / 3} /> : null}
      </Animated.View>
    </Pressable>
  );
}
