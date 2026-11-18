import Constants from 'expo-constants';
import { Pressable, Switch, Text, View } from 'react-native';

import { UpdateNotice } from '@/components/UpdateNotice';
import { type CheckNowStatus, useCheckNow } from '@/hooks/updates/useCheckNow';
import { useInstallUpdate } from '@/hooks/updates/useInstallUpdate';
import { useUpdateCheckSetting } from '@/hooks/updates/useUpdateCheckSetting';
import { styles } from '@/screens/catalog/AppUpdates/styles';
import { colors } from '@/theme/tokens';

const MESSAGES: Partial<Record<CheckNowStatus, string>> = {
  checking: 'Checking…',
  latest: 'You have the latest version.',
  failed: "Couldn't check for updates. Check your connection and try again.",
};

export function AppUpdates() {
  const { enabled, update } = useUpdateCheckSetting();
  const checkNow = useCheckNow();
  const install = useInstallUpdate(checkNow.update);
  const checking = checkNow.status === 'checking';
  const message = MESSAGES[checkNow.status];

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
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: checking }}
        disabled={checking}
        onPress={checkNow.check}
        style={[styles.button, checking && styles.disabled]}
      >
        <Text style={styles.buttonLabel}>Check now</Text>
      </Pressable>
      {message ? (
        <Text style={checkNow.status === 'failed' ? styles.error : styles.text} accessibilityLiveRegion="polite">
          {message}
        </Text>
      ) : null}
      {checkNow.update ? (
        <UpdateNotice
          version={checkNow.update.version}
          status={install.status}
          percent={install.percent}
          onInstall={install.install}
          onDismiss={checkNow.snooze}
        />
      ) : null}
    </View>
  );
}
