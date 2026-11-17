import { Pressable, Text, View } from 'react-native';

import { styles } from '@/screens/discover/UpdateNotice/styles';

type Props = {
  version: string;
  onInstall: () => void;
  onDismiss: () => void;
};

/** GLOSSARY: Update notice. Release notes are deliberately not shown. */
export function UpdateNotice({ version, onInstall, onDismiss }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.text}>{`NoSpyFi ${version} is available. Installing stops the radio.`}</Text>
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" accessibilityLabel="Not now" onPress={onDismiss} style={styles.secondary}>
          <Text style={styles.secondaryLabel}>Not now</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Install" onPress={onInstall} style={styles.primary}>
          <Text style={styles.primaryLabel}>Install</Text>
        </Pressable>
      </View>
    </View>
  );
}
