import { TabTrigger } from 'expo-router/ui';
import { View } from 'react-native';

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
  const tabs = ITEMS.map(({ name, ...item }) => (
    <TabTrigger key={name} name={name} asChild>
      <NavItem {...item} rail={rail} />
    </TabTrigger>
  ));
  if (!rail) return <View style={styles.bottom}>{tabs}</View>;
  return (
    <View style={styles.rail}>
      <Clock />
      <View style={styles.railItems}>{tabs}</View>
      <LauncherButton />
    </View>
  );
}
