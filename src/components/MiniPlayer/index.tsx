import { router } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { IconButton } from '@/components/IconButton';
import { styles } from '@/components/MiniPlayer/styles';
import { Spectrum } from '@/components/Spectrum';
import { StationArtwork } from '@/components/StationArtwork';
import { nowPlayingLine } from '@/helpers/player/nowPlayingLine';
import { statusLabel } from '@/helpers/player/statusLabel';
import { usePlayerControls } from '@/hooks/player/usePlayerControls';
import { colors } from '@/theme/tokens';

const ARTWORK_SIZE = 44;

export function MiniPlayer() {
  const { player, isActive, toggleMain, retry } = usePlayerControls();
  const { station, status } = player;
  if (!station) return null;

  return (
    <View style={styles.root}>
      <Spectrum />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open player: ${station.name}`}
        onPress={() => router.push('/player')}
        style={styles.main}
      >
        <StationArtwork favicon={station.favicon} size={ARTWORK_SIZE} />
        <View style={styles.texts}>
          <Text style={styles.name} numberOfLines={1}>
            {station.name}
          </Text>
          <Text style={styles.status} numberOfLines={1}>
            {nowPlayingLine(player) ?? statusLabel(status)}
          </Text>
        </View>
      </Pressable>
      {status === 'loading' || status === 'buffering' ? <ActivityIndicator color={colors.accent} /> : null}
      {status === 'error' ? (
        <IconButton icon="refresh" label="Retry" onPress={retry} />
      ) : (
        <IconButton icon={isActive ? 'pause' : 'play'} label={isActive ? 'Pause' : 'Resume'} onPress={toggleMain} />
      )}
    </View>
  );
}
