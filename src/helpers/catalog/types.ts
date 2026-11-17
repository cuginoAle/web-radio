export type StationTag = {
  /** Normalized grouping key (GLOSSARY: Tag group). */
  key: string;
  /** Original spelling, for display. */
  label: string;
};

/** A station as stored in a catalog generation. */
export type CatalogStation = {
  uuid: string;
  name: string;
  searchKey: string;
  url: string;
  urlResolved: string;
  favicon: string | null;
  country: string;
  countryCode: string;
  languages: string;
  codec: string;
  bitrate: number;
  /** GLOSSARY: Popularity. */
  clickCount: number;
  hls: boolean;
  lastCheckOk: boolean;
  lastCheckTime: string | null;
  tags: StationTag[];
};

export type StationPage = { ok: true; stations: CatalogStation[] } | { ok: false; error: string };
