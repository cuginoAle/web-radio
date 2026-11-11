import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Equalizer } from '@/components/Equalizer';
import { IconButton } from '@/components/IconButton';
import { StationArtwork } from '@/components/StationArtwork';
import { styles } from '@/components/StationRow/styles';
import type { PlayerStatus } from '@/state/slices/player';
import { colors } from '@/theme/tokens';

type Props = {
  name: string;
  subtitle: string;
  favicon: string | null;
  warning?: string | null;
  playback: PlayerStatus | null;
  isFavorite: boolean;
  playLabel?: string;
  onPlay: () => void;
  onToggleFavorite: () => void;
};

const ARTWORK_SIZE = 56;

export function StationRow({ name, subtitle, favicon, warning, playback, isFavorite, playLabel, onPlay, onToggleFavorite }: Props) {
  const isActive = playback === 'playing' || playback === 'loading' || playback === 'buffering';
  return (
    <View style={[styles.row, playback !== null && styles.current]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={subtitle ? `${name}, ${subtitle}` : name}
        onPress={onPlay}
        style={styles.main}
      >
        <StationArtwork favicon={favicon} size={ARTWORK_SIZE} />
        <View style={styles.texts}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
          {warning ? (
            <Text style={styles.warning} numberOfLines={2}>
              {warning}
            </Text>
          ) : null}
        </View>
      </Pressable>
      {playback === 'playing' ? <Equalizer /> : null}
      {playback === 'loading' || playback === 'buffering' ? <ActivityIndicator color={colors.accent} /> : null}
      <IconButton
        icon={isFavorite ? 'heart' : 'heart-outline'}
        color={isFavorite ? colors.accent : colors.text}
        label={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
        selected={isFavorite}
        onPress={onToggleFavorite}
      />
      <IconButton
        icon={isActive ? 'pause-circle-outline' : 'play-circle-outline'}
        size={32}
        label={isActive ? `Metti in pausa ${name}` : (playLabel ?? `Ascolta ${name}`)}
        onPress={onPlay}
      />
    </View>
  );
}
