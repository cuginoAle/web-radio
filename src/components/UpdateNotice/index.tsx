import { Pressable, Text, View } from 'react-native';

import type { InstallStatus } from '@/hooks/updates/useInstallUpdate';
import { styles } from '@/components/UpdateNotice/styles';

type Props = {
  version: string;
  status: InstallStatus;
  percent: number;
  onInstall: () => void;
  onDismiss: () => void;
};

const message = (version: string, status: InstallStatus, percent: number) => {
  if (status === 'downloading') return `Downloading NoSpyFi ${version}… ${percent}%`;
  if (status === 'failed') return 'Download failed.';
  return `NoSpyFi ${version} is available. Installing stops the radio.`;
};

/** GLOSSARY: Update notice. Release notes are deliberately not shown. */
export function UpdateNotice({ version, status, percent, onInstall, onDismiss }: Props) {
  const label = status === 'failed' ? 'Retry' : 'Install';
  return (
    <View style={styles.root}>
      <Text style={styles.text}>{message(version, status, percent)}</Text>
      {status === 'downloading' ? null : (
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Not now" onPress={onDismiss} style={styles.secondary}>
            <Text style={styles.secondaryLabel}>Not now</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onInstall} style={styles.primary}>
            <Text style={styles.primaryLabel}>{label}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
