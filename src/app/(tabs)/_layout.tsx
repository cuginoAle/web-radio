import { AppShell } from '@/screens/shell';
import { WelcomeScreen } from '@/screens/welcome';
import { useGlobalState } from '@/state/global-state';

export default function TabsLayout() {
  const hasCatalog = useGlobalState((s) => s.catalog.generationId !== null);
  return hasCatalog ? <AppShell /> : <WelcomeScreen />;
}
