import { Image } from 'expo-image';
import { View } from 'react-native';

import { styles } from '@/components/Logo/styles';

export function Logo() {
  return (
    <View style={styles.root}>
      <Image
        source={require('@/assets/images/nospyfi.webp')}
        style={styles.logo}
        contentFit="contain"
        accessible
        accessibilityRole="image"
        accessibilityLabel="NoSpyFi"
      />
    </View>
  );
}
