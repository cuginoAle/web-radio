import type { CatalogStation, StationPage, StationTag } from '@/helpers/catalog/types';
import { normalizeText } from '@/helpers/search/normalizeText';

type Raw = Record<string, unknown>;

const UNNAMED = 'Radio senza nome';

// Remote metadata is plain text: drop control characters and redundant whitespace.
const text = (value: unknown) =>
  typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim() : '';

const httpUrl = (value: unknown) => {
  const url = text(value);
  return /^https?:\/\/\S+$/i.test(url) ? url : null;
};

const count = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

const toTags = (value: unknown): StationTag[] => {
  const byKey = new Map<string, StationTag>();
  for (const label of text(value).split(',').map(text)) {
    const key = label.toLowerCase();
    if (key && !byKey.has(key)) byKey.set(key, { key, label });
  }
  return [...byKey.values()];
};

const toStation = (raw: Raw): CatalogStation => {
  const name = text(raw.name) || UNNAMED;
  return {
    uuid: text(raw.stationuuid),
    name,
    searchKey: normalizeText(name),
    url: text(raw.url),
    urlResolved: text(raw.url_resolved),
    favicon: httpUrl(raw.favicon),
    country: text(raw.country),
    countryCode: text(raw.countrycode),
    languages: text(raw.language),
    codec: text(raw.codec),
    bitrate: count(raw.bitrate),
    hls: raw.hls === 1,
    lastCheckOk: raw.lastcheckok === 1,
    lastCheckTime: text(raw.lastchecktime_iso8601) || null,
    tags: toTags(raw.tags),
  };
};

/** Validates and normalizes one /json/stations page. */
export function normalizeStationPage(json: unknown): StationPage {
  if (!Array.isArray(json)) return { ok: false, error: 'La risposta della directory non è un elenco di radio.' };
  const isValid = (raw: unknown): raw is Raw =>
    typeof raw === 'object' && raw !== null && text((raw as Raw).stationuuid) !== '';
  // One bad record invalidates the page: an incomplete copy must never become the catalog.
  if (!json.every(isValid)) return { ok: false, error: 'La directory ha inviato una radio senza identificativo.' };
  return { ok: true, stations: json.map(toStation) };
}
