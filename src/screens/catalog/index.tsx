import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModalHeader } from '@/components/ModalHeader';
import { useIsWideLayout } from '@/hooks/layout/useIsWideLayout';
import { AppUpdates } from '@/screens/catalog/AppUpdates';
import { CatalogRefresh } from '@/screens/catalog/CatalogRefresh';
import { styles } from '@/screens/catalog/styles';

export function CatalogScreen() {
  const isWide = useIsWideLayout();

  return (
    <SafeAreaView style={styles.root}>
      <ModalHeader title="About NoSpyFi" />
      <ScrollView contentContainerStyle={isWide ? styles.wide : styles.content}>
        <View style={isWide ? styles.primary : undefined}>
          <CatalogRefresh />
        </View>
        <View style={isWide ? styles.secondary : styles.divided}>
          <AppUpdates />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
