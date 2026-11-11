import { useEffect } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModalHeader } from '@/components/ModalHeader';
import { formatDateTime } from '@/helpers/format/formatDateTime';
import { useCatalogRefresh } from '@/hooks/catalog/useCatalogRefresh';
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
      <ModalHeader title="Catalogo radio" />
      <View style={styles.content}>
        <Text style={styles.count}>{`${catalog.stationCount} radio in questa copia`}</Text>
        {catalog.lastSuccessAt ? (
          <Text style={styles.text}>{`Ultimo aggiornamento: ${formatDateTime(catalog.lastSuccessAt)}`}</Text>
        ) : null}
        <Text style={styles.text}>
          Riscaricare il catalogo usa alcune decine di MB di traffico Internet. Ascolto e preferiti continuano a
          funzionare durante il download.
        </Text>
        {running ? (
          <View style={styles.progress} accessibilityLiveRegion="polite">
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.text}>{`${sync.imported} radio ricevute`}</Text>
          </View>
        ) : null}
        {sync.phase === 'done' ? <Text style={styles.confirm}>Catalogo aggiornato</Text> : null}
        {sync.phase === 'cancelled' ? <Text style={styles.text}>Download annullato. Il catalogo non è cambiato.</Text> : null}
        {sync.phase === 'failed' ? <Text style={styles.error}>{sync.error}</Text> : null}
        <Pressable accessibilityRole="button" onPress={running ? cancel : start} style={[styles.button, running && styles.secondary]}>
          <Text style={[styles.label, running && styles.secondaryLabel]}>
            {running ? 'Annulla' : sync.phase === 'failed' ? 'Riprova' : 'Riscarica catalogo'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
