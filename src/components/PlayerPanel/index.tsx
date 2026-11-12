import { ActivityIndicator, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { Equalizer } from '@/components/Equalizer';
import { IconButton } from '@/components/IconButton';
import { LiveBadge } from '@/components/LiveBadge';
import { PlayerControls } from '@/components/PlayerControls';
import { ArtworkToggle } from '@/components/PlayerPanel/ArtworkToggle';
import { styles } from '@/components/PlayerPanel/styles';
import { StationArtwork } from '@/components/StationArtwork';
import { statusLabel } from '@/helpers/player/statusLabel';
import { usePlayerControls } from '@/hooks/player/usePlayerControls';
import { colors } from '@/theme/tokens';

const MAX_ARTWORK = 320;

type Props = {
  /** Landscape side panel: the artwork is the only playback control. */
  side?: boolean;
};

/** The full player: the phone modal and the side panel show the same single session. */
export function PlayerPanel({ side = false }: Props) {
  const { player, isActive, isFavorite, toggleMain, onToggleFavorite, next, previous, retry } = usePlayerControls();
  const { width, height } = useWindowDimensions();
  const { station, status } = player;
  const artworkSize = Math.min(MAX_ARTWORK, width * 0.28 + 120, height * 0.4);

  if (!station) {
    return <Text style={styles.prompt}>Scegli una radio per iniziare l’ascolto</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.root}>
      {side ? (
        <ArtworkToggle favicon={station.favicon} size={artworkSize} status={status} onPress={toggleMain} />
      ) : (
        <StationArtwork favicon={station.favicon} size={artworkSize} />
      )}
      <View style={styles.heading}>
        <View style={styles.titles}>
          <Text style={styles.name} accessibilityRole="header">
            {station.name}
          </Text>
          {station.subtitle ? <Text style={styles.subtitle}>{station.subtitle}</Text> : null}
        </View>
        <IconButton
          icon={isFavorite ? 'heart' : 'heart-outline'}
          color={isFavorite ? colors.accent : colors.text}
          label={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
          selected={isFavorite}
          onPress={onToggleFavorite}
        />
      </View>
      {side ? null : (
        <View style={styles.status} accessibilityLiveRegion="polite">
          {status === 'playing' ? <LiveBadge /> : null}
          {status === 'playing' ? <Equalizer /> : null}
          {status === 'loading' || status === 'buffering' ? <ActivityIndicator color={colors.accent} /> : null}
          <Text style={styles.statusLabel}>{statusLabel(status)}</Text>
        </View>
      )}
      {status === 'error' ? (
        <View style={styles.errorBox}>
          <Text style={styles.error}>{player.error}</Text>
          {side ? null : (
            <Pressable accessibilityRole="button" onPress={retry} style={styles.retry}>
              <Text style={styles.retryLabel}>Riprova</Text>
            </Pressable>
          )}
        </View>
      ) : side ? null : (
        <PlayerControls
          isActive={isActive}
          canPrevious={player.canPrevious}
          canNext={player.canNext}
          onToggle={toggleMain}
          onPrevious={previous}
          onNext={next}
        />
      )}
    </ScrollView>
  );
}
