import type Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';

import { IconButton } from '@/components/IconButton';
import { styles } from '@/components/ModalHeader/styles';

type Props = {
  title: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
};

export function ModalHeader({ title, icon = 'arrow-back' }: Props) {
  return (
    <View style={styles.root}>
      <IconButton icon={icon} label="Chiudi" onPress={() => router.back()} />
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
    </View>
  );
}
