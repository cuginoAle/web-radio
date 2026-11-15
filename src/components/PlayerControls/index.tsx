import { View } from 'react-native';

import { IconButton } from '@/components/IconButton';
import { styles } from '@/components/PlayerControls/styles';

type Props = {
  isActive: boolean;
  canPrevious: boolean;
  canNext: boolean;
  onToggle: () => void;
  onPrevious: () => void;
  onNext: () => void;
};

export function PlayerControls({ isActive, canPrevious, canNext, onToggle, onPrevious, onNext }: Props) {
  return (
    <View style={styles.row}>
      <IconButton icon="play-skip-back" size={30} label="Previous station" disabled={!canPrevious} onPress={onPrevious} />
      <View style={styles.main}>
        <IconButton
          icon={isActive ? 'pause' : 'play'}
          size={36}
          variant="filled"
          label={isActive ? 'Pause' : 'Resume'}
          onPress={onToggle}
        />
      </View>
      <IconButton icon="play-skip-forward" size={30} label="Next station" disabled={!canNext} onPress={onNext} />
    </View>
  );
}
