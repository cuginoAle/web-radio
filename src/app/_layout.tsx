import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { useBootstrap } from '@/hooks/app/useBootstrap';
import { colors } from '@/theme/tokens';

const background = { flex: 1, justifyContent: 'center', backgroundColor: colors.background } as const;

export default function RootLayout() {
  const status = useBootstrap();

  if (status === 'loading') return <View style={background} />;
  if (status === 'error') {
    return (
      <View style={background}>
        <EmptyState title="Errore del database" message="Non è stato possibile aprire i dati locali dell’app." />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="player" options={{ presentation: 'modal' }} />
        <Stack.Screen name="catalog" options={{ presentation: 'modal' }} />
        <Stack.Screen name="tags" />
      </Stack>
    </>
  );
}
