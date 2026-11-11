import { ActivityIndicator, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { Equalizer } from '@/components/Equalizer';
import { IconButton } from '@/components/IconButton';
import { LiveBadge } from '@/components/LiveBadge';
import { PlayerControls } from '@/components/PlayerControls';
import { styles } from '@/components/PlayerPanel/styles';
import { StationArtwork } from '@/components/StationArtwork';
import { statusLabel } from '@/helpers/player/statusLabel';
import { usePlayerControls } from '@/hooks/player/usePlayerControls';
import { colors } from '@/theme/tokens';

const MAX_ARTWORK = 320;

/** The full player: the phone modal and the tablet side panel show the same single session. */
export function PlayerPanel() {
  const { player, isActive, isFavorite, toggleMain, onToggleFavorite, next, previous, retry } = usePlayerControls();
  const { width, height } = useWindowDimensions();
  const { station, status } = player;

  if (!station) {
    return <Text style={styles.prompt}>Scegli una radio per iniziare l’ascolto</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <StationArtwork favicon={station.favicon} size={Math.min(MAX_ARTWORK, width * 0.28 + 120, height * 0.4)} />
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
      <View style={styles.status} accessibilityLiveRegion="polite">
        {status === 'playing' ? <LiveBadge /> : null}
        {status === 'playing' ? <Equalizer /> : null}
        {status === 'loading' || status === 'buffering' ? <ActivityIndicator color={colors.accent} /> : null}
        <Text style={styles.statusLabel}>{statusLabel(status)}</Text>
      </View>
      {status === 'error' ? (
        <View style={styles.errorBox}>
          <Text style={styles.error}>{player.error}</Text>
          <Pressable accessibilityRole="button" onPress={retry} style={styles.retry}>
            <Text style={styles.retryLabel}>Riprova</Text>
          </Pressable>
        </View>
      ) : (
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
