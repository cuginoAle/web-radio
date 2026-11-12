import { BackHandler } from 'react-native';

import { IconButton } from '@/components/IconButton';

// Not a quit: MainActivity moves the root task to background, so playback continues.
// A HOME intent through expo-intent-launcher is refused by Android (START_CANCELED).
export function LauncherButton() {
  return <IconButton icon="apps-outline" label="Torna alle app" onPress={() => BackHandler.exitApp()} />;
}
