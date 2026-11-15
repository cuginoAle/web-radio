import Ionicons from '@expo/vector-icons/Ionicons';
import { TextInput, View } from 'react-native';

import { IconButton } from '@/components/IconButton';
import { styles } from '@/screens/search/SearchField/styles';
import { colors } from '@/theme/tokens';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchField({ value, onChange }: Props) {
  return (
    <View style={styles.root}>
      <Ionicons name="search" size={20} color={colors.textMuted} />
      <TextInput
        accessibilityLabel="Search by name"
        autoCorrect={false}
        placeholder="Station name"
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        style={styles.input}
        value={value}
        onChangeText={onChange}
      />
      {value ? <IconButton icon="close-circle" size={20} label="Clear search" color={colors.textMuted} onPress={() => onChange('')} /> : null}
    </View>
  );
}
