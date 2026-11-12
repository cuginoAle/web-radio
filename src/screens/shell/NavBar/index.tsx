import { TabTrigger } from 'expo-router/ui';
import { Text, View } from 'react-native';

import { Clock } from '@/components/Clock';
import { LauncherButton } from '@/screens/shell/NavBar/LauncherButton';
import { NavItem, type IconName } from '@/screens/shell/NavBar/NavItem';
import { styles } from '@/screens/shell/NavBar/styles';

const ITEMS: { name: string; label: string; icon: IconName; activeIcon: IconName }[] = [
  { name: 'discover', label: 'Scopri', icon: 'home-outline', activeIcon: 'home' },
  { name: 'search', label: 'Cerca', icon: 'search-outline', activeIcon: 'search' },
  { name: 'favorites', label: 'Preferiti', icon: 'heart-outline', activeIcon: 'heart' },
];

export function NavBar({ rail }: { rail: boolean }) {
  return (
    <View style={rail ? styles.rail : styles.bottom}>
      {rail ? <LauncherButton /> : null}
      {rail ? <Clock /> : null}
      {rail ? <Text style={styles.brand}>RADIO</Text> : null}
      {ITEMS.map(({ name, ...item }) => (
        <TabTrigger key={name} name={name} asChild>
          <NavItem {...item} rail={rail} />
        </TabTrigger>
      ))}
    </View>
  );
}
