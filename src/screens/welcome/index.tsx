import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { ScreenTitle } from '@/components/ScreenTitle';
import { useCatalogRefresh } from '@/hooks/catalog/useCatalogRefresh';
import { styles } from '@/screens/welcome/styles';
import { colors } from '@/theme/tokens';

export function WelcomeScreen() {
  const { sync, start, cancel } = useCatalogRefresh();

  if (sync.phase === 'failed' || sync.phase === 'cancelled') {
    return (
      <SafeAreaView style={styles.root}>
        <EmptyState
          title="Catalogo non disponibile"
          message={sync.error ?? 'Il download è stato annullato.'}
          actionLabel="Riprova"
          onAction={start}
        />
      </SafeAreaView>
    );
  }

  const running = sync.phase === 'running';
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <ScreenTitle title="La tua frequenza." subtitle="Il suono giusto, adesso." />
        {running ? (
          <View style={styles.progress} accessibilityLiveRegion="polite">
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.count}>{`${sync.imported} radio ricevute`}</Text>
          </View>
        ) : (
          <Text style={styles.text}>
            Per iniziare scarica il catalogo delle radio. Serve una connessione a Internet e usa alcune decine di MB di
            traffico. L’audio resta in streaming: il catalogo non rende la musica disponibile offline.
          </Text>
        )}
        <Pressable
          accessibilityRole="button"
          onPress={running ? cancel : start}
          style={[styles.button, running && styles.secondary]}
        >
          <Text style={[styles.label, running && styles.secondaryLabel]}>{running ? 'Annulla' : 'Scarica catalogo'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
