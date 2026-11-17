import Constants from 'expo-constants';
import { Switch, Text, View } from 'react-native';

import { useUpdateCheckSetting } from '@/hooks/updates/useUpdateCheckSetting';
import { styles } from '@/screens/catalog/AppUpdates/styles';
import { colors } from '@/theme/tokens';

export function AppUpdates() {
  const { enabled, update } = useUpdateCheckSetting();
  return (
    <View style={styles.root}>
      <Text style={styles.heading} accessibilityRole="header">
        App updates
      </Text>
      <Text style={styles.text}>{`Version ${Constants.expoConfig?.version ?? 'unknown'}`}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Check for updates</Text>
        <Switch
          accessibilityLabel="Check for updates"
          value={enabled}
          onValueChange={update}
          trackColor={{ false: colors.surfaceRaised, true: colors.accent }}
          thumbColor={colors.text}
        />
      </View>
    </View>
  );
}
