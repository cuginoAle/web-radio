import { loadCatalogState } from '@/services/catalog-sync/loadCatalogState';
import { DirectoryError } from '@/services/radio-browser/DirectoryError';
import { getRuntime } from '@/services/runtime';
import { globalStore } from '@/state/global-state';

const GENERIC_ERROR = 'Impossibile aggiornare il catalogo. Riprova.';

let cancelRequested = false;

/** Runs a Riscarica and mirrors its progress in the store; never rejects. */
export async function startRefresh() {
  const { setSync } = globalStore.getState();
  cancelRequested = false;
  setSync({ phase: 'running', imported: 0, error: null });
  try {
    await getRuntime().sync.refresh((imported) => setSync({ imported }));
    await loadCatalogState();
    setSync({ phase: 'done' });
  } catch (error) {
    if (cancelRequested) return setSync({ phase: 'cancelled' });
    setSync({ phase: 'failed', error: error instanceof DirectoryError ? error.message : GENERIC_ERROR });
  }
}

export function cancelRefresh() {
  cancelRequested = true;
  getRuntime().sync.cancel();
}
