import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { View } from 'react-native';

import { styles } from '@/components/StationArtwork/styles';
import { colors } from '@/theme/tokens';

type Props = {
  favicon: string | null;
  size: number;
};

// The local placeholder sits under the image: a missing or broken favicon simply leaves it visible.
export function StationArtwork({ favicon, size }: Props) {
  return (
    <View
      style={[styles.frame, { width: size, height: size }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Ionicons name="radio-outline" size={size * 0.45} color={colors.textMuted} />
      {favicon ? (
        <Image source={{ uri: favicon }} style={styles.image} contentFit="cover" cachePolicy="disk" recyclingKey={favicon} />
      ) : null}
    </View>
  );
}
