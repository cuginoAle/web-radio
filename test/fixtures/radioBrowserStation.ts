// A real /json/stations record (Radio Browser, sampled 10 Nov 2026), trimmed of fields the app ignores.
const classicVinyl = {
  changeuuid: '16db532a-778d-4c7c-a79a-38858f24f933',
  stationuuid: 'd1a54d2e-623e-4970-ab11-35f7b56c5ec3',
  serveruuid: null,
  name: 'Classic Vinyl HD',
  url: 'https://icecast.walmradio.com:8443/classic',
  url_resolved: 'https://icecast.walmradio.com:8443/classic',
  homepage: 'https://walmradio.com/classic',
  favicon: 'https://icecast.walmradio.com:8443/classic.jpg',
  tags: 'big band,jazz,swing',
  country: 'The United States Of America',
  countrycode: 'US',
  state: 'New York NY',
  language: 'english',
  languagecodes: 'en',
  codec: 'MP3',
  bitrate: 320,
  hls: 0,
  lastcheckok: 1,
  lastchecktime_iso8601: '2026-11-06T17:10:35Z',
  geo_lat: 40.75166,
  has_extended_info: true,
};

export type RawStation = Record<string, unknown>;

/** A directory record; override any field, or pass `undefined` to drop it. */
export const rawStation = (overrides: RawStation = {}): RawStation => ({ ...classicVinyl, ...overrides });
