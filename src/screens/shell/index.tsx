import { TabList, TabSlot, Tabs, TabTrigger } from 'expo-router/ui';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MiniPlayer } from '@/components/MiniPlayer';
import { PlayerPanel } from '@/components/PlayerPanel';
import { useIsWideLayout } from '@/hooks/layout/useIsWideLayout';
import { NavBar } from '@/screens/shell/NavBar';
import { styles } from '@/screens/shell/styles';

export function AppShell() {
  const isWide = useIsWideLayout();
  const insets = useSafeAreaInsets();

  // Children keep their positions in both layouts so TabSlot is never remounted on rotation.
  return (
    <Tabs style={styles.root}>
      <TabList style={styles.hidden}>
        <TabTrigger name="discover" href="/" />
        <TabTrigger name="search" href="/search" />
        <TabTrigger name="favorites" href="/favorites" />
      </TabList>
      <View style={[isWide ? styles.row : styles.column, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {isWide ? <NavBar rail /> : null}
        <View style={styles.content}>
          <TabSlot />
        </View>
        {isWide ? (
          <View style={styles.panel}>
            <PlayerPanel side />
          </View>
        ) : null}
        {isWide ? null : <MiniPlayer />}
        {isWide ? null : <NavBar rail={false} />}
      </View>
    </Tabs>
  );
}
