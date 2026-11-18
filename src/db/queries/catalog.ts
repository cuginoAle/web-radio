import type { Db } from '@/db/types';

export type MetadataKey =
  | 'active_generation'
  | 'active_count'
  | 'last_success_at'
  | 'last_mirror'
  | 'favorites_seeded'
  | 'update_check_enabled'
  | 'update_last_check_at'
  | 'update_version'
  | 'update_apk_url'
  | 'update_snoozed_until'
  | 'update_install_explained'
  | 'last_station';

export async function getMetadata(db: Db, key: MetadataKey) {
  const row = await db.getFirstAsync<{ value: string | null }>('SELECT value FROM app_metadata WHERE key = ?', [key]);
  return row?.value ?? null;
}

export type CatalogStatus = {
  generationId: number | null;
  stationCount: number;
  lastSuccessAt: string | null;
};

/** What the user can browse right now (GLOSSARY: Catalogue = active generation). */
export async function getCatalogStatus(db: Db): Promise<CatalogStatus> {
  const rows = await db.getAllAsync<{ key: MetadataKey; value: string | null }>(
    "SELECT key, value FROM app_metadata WHERE key IN ('active_generation', 'active_count', 'last_success_at')",
    [],
  );
  const meta = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    generationId: meta.active_generation ? Number(meta.active_generation) : null,
    stationCount: Number(meta.active_count ?? 0),
    lastSuccessAt: meta.last_success_at ?? null,
  };
}
