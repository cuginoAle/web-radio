import { Text, View } from 'react-native';

import { styles } from '@/components/ScreenTitle/styles';

type Props = {
  title: string;
  subtitle?: string;
};

export function ScreenTitle({ title, subtitle }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}
