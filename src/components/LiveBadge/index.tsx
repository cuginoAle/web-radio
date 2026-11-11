import { Text, View } from 'react-native';

import { styles } from '@/components/LiveBadge/styles';

export function LiveBadge() {
  return (
    <View style={styles.badge}>
      <View style={styles.dot} />
      <Text style={styles.label}>LIVE</Text>
    </View>
  );
}
