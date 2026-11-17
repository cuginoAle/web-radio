import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

// `currentState` can be null at launch, so only an explicit 'background' counts as away.
const isActive = (state: string | null | undefined) => state !== 'background';

/** Whether the app is in the foreground with the screen on. */
export function useAppActive() {
  const [active, setActive] = useState(isActive(AppState.currentState));

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => setActive(isActive(state)));
    return () => subscription.remove();
  }, []);

  return active;
}
