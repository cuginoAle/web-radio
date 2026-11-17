import { Text, View } from 'react-native';

import { styles } from '@/components/Clock/styles';
import { useClock } from '@/hooks/layout/useClock';

export function Clock() {
  const [time, period] = useClock().split(/\s/);

  return (
    <View style={styles.pill}>
      <Text style={styles.label}>{time}</Text>
      <Text style={styles.period}>{period}</Text>
    </View>
  );
}
