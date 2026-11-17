import { Pressable, Text } from 'react-native';

import { styles } from '@/screens/welcome/styles';

type Props = {
  onAnswer: (enabled: boolean) => void;
};

export function UpdateCheckQuestion({ onAnswer }: Props) {
  return (
    <>
      <Text style={styles.text}>Check for new versions when I open NoSpyFi? It contacts GitHub.</Text>
      <Pressable accessibilityRole="button" onPress={() => onAnswer(true)} style={styles.button}>
        <Text style={styles.label}>Yes</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => onAnswer(false)} style={[styles.button, styles.secondary]}>
        <Text style={[styles.label, styles.secondaryLabel]}>No, I use Obtainium or update by hand</Text>
      </Pressable>
    </>
  );
}
