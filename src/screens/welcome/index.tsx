import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { ScreenTitle } from '@/components/ScreenTitle';
import { formatStationCount } from '@/helpers/format/formatStationCount';
import { useCatalogRefresh } from '@/hooks/catalog/useCatalogRefresh';
import { styles } from '@/screens/welcome/styles';
import { colors } from '@/theme/tokens';

export function WelcomeScreen() {
  const { sync, start, cancel } = useCatalogRefresh();

  if (sync.phase === 'failed' || sync.phase === 'cancelled') {
    return (
      <SafeAreaView style={styles.root}>
        <EmptyState
          title="Catalogue unavailable"
          message={sync.error ?? 'The download was cancelled.'}
          actionLabel="Retry"
          onAction={start}
        />
      </SafeAreaView>
    );
  }

  const running = sync.phase === 'running';
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <ScreenTitle title="Your frequency." subtitle="The right sound, right now." />
        {running ? (
          <View style={styles.progress} accessibilityLiveRegion="polite">
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.count}>{`${formatStationCount(sync.imported)} received`}</Text>
          </View>
        ) : (
          <Text style={styles.text}>
            To get started, download the station catalogue. It needs an internet connection and uses a few tens of MB of
            data. Audio is still streamed: the catalogue does not make music available offline.
          </Text>
        )}
        <Pressable
          accessibilityRole="button"
          onPress={running ? cancel : start}
          style={[styles.button, running && styles.secondary]}
        >
          <Text style={[styles.label, running && styles.secondaryLabel]}>{running ? 'Cancel' : 'Download catalogue'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
