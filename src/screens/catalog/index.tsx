import { useEffect } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModalHeader } from '@/components/ModalHeader';
import { formatStationCount } from '@/helpers/format/formatStationCount';
import { formatDateTime } from '@/helpers/format/formatDateTime';
import { useCatalogRefresh } from '@/hooks/catalog/useCatalogRefresh';
import { AppUpdates } from '@/screens/catalog/AppUpdates';
import { styles } from '@/screens/catalog/styles';
import { globalStore, useGlobalState } from '@/state/global-state';
import { colors } from '@/theme/tokens';

export function CatalogScreen() {
  const catalog = useGlobalState((s) => s.catalog);
  const { sync, start, cancel } = useCatalogRefresh();
  const running = sync.phase === 'running';

  useEffect(() => {
    // Outcome messages belong to the visit that produced them.
    const { sync: current, setSync } = globalStore.getState();
    if (current.phase !== 'running') setSync({ phase: 'idle', error: null });
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <ModalHeader title="About NoSpyFi" />
      <View style={styles.content}>
        <Text style={styles.count}>{`${formatStationCount(catalog.stationCount)} stored on this device`}</Text>
        {catalog.lastSuccessAt ? (
          <Text style={styles.text}>{`Last updated: ${formatDateTime(catalog.lastSuccessAt)}`}</Text>
        ) : null}
        <Text style={styles.text}>
          Refreshing the catalogue uses a few tens of MB of internet data. Listening and favourites keep working
          during the download.
        </Text>
        {running ? (
          <View style={styles.progress} accessibilityLiveRegion="polite">
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.text}>{`${formatStationCount(sync.imported)} received`}</Text>
          </View>
        ) : null}
        {sync.phase === 'done' ? <Text style={styles.confirm}>Catalogue updated</Text> : null}
        {sync.phase === 'cancelled' ? <Text style={styles.text}>Download cancelled. The catalogue has not changed.</Text> : null}
        {sync.phase === 'failed' ? <Text style={styles.error}>{sync.error}</Text> : null}
        <Pressable accessibilityRole="button" onPress={running ? cancel : start} style={[styles.button, running && styles.secondary]}>
          <Text style={[styles.label, running && styles.secondaryLabel]}>
            {running ? 'Cancel' : sync.phase === 'failed' ? 'Retry' : 'Refresh catalogue'}
          </Text>
        </Pressable>
        <AppUpdates />
      </View>
    </SafeAreaView>
  );
}
