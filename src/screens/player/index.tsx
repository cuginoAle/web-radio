import { router } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModalHeader } from '@/components/ModalHeader';
import { PlayerPanel } from '@/components/PlayerPanel';
import { useIsWideLayout } from '@/hooks/layout/useIsWideLayout';
import { styles } from '@/screens/player/styles';

export function PlayerScreen() {
  const isWide = useIsWideLayout();

  useEffect(() => {
    // In three columns the side panel is the player: no separate screen, same audio session.
    if (isWide && router.canGoBack()) router.back();
  }, [isWide]);

  return (
    <SafeAreaView style={styles.root}>
      <ModalHeader title="In ascolto" icon="chevron-down" />
      <PlayerPanel />
    </SafeAreaView>
  );
}
