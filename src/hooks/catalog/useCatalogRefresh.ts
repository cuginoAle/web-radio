import { cancelRefresh, startRefresh } from '@/services/catalog-sync/refreshFlow';
import { useGlobalState } from '@/state/global-state';

export function useCatalogRefresh() {
  const sync = useGlobalState((s) => s.sync);
  return { sync, start: () => void startRefresh(), cancel: cancelRefresh };
}
