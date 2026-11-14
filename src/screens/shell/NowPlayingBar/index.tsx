import { Text, View } from 'react-native';

import { nowPlayingLine } from '@/helpers/player/nowPlayingLine';
import { styles } from '@/screens/shell/NowPlayingBar/styles';
import { useGlobalState } from '@/state/global-state';

/** Landscape bottom line: keeps its height while a station is selected, so pausing never shifts the columns. */
export function NowPlayingBar() {
  const player = useGlobalState((s) => s.player);
  if (!player.station) return null;

  return (
    <View style={styles.root} testID="now-playing-bar">
      <Text style={styles.song} numberOfLines={1}>
        {nowPlayingLine(player)}
      </Text>
    </View>
  );
}
