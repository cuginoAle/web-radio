import { Pressable, Text } from 'react-native';

import { StationArtwork } from '@/components/StationArtwork';
import { styles } from '@/screens/discover/FavoritePill/styles';

type Props = {
  name: string;
  favicon: string | null;
  onPress: () => void;
};

const ARTWORK_SIZE = 32;

export function FavoritePill({ name, favicon, onPress }: Props) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Ascolta ${name}`} onPress={onPress} style={styles.pill}>
      <StationArtwork favicon={favicon} size={ARTWORK_SIZE} />
      <Text style={styles.label} numberOfLines={1}>
        {name}
      </Text>
    </Pressable>
  );
}
