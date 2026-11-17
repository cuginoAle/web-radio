import { normalizeStationPage } from '@/helpers/catalog/normalizeStationPage';
import { rawStation } from '@test/fixtures/radioBrowserStation';

it('turns a directory record into a catalog station', () => {
  const page = normalizeStationPage([rawStation()]);

  expect(page).toEqual({
    ok: true,
    stations: [
      {
        uuid: 'd1a54d2e-623e-4970-ab11-35f7b56c5ec3',
        name: 'Classic Vinyl HD',
        searchKey: 'classic vinyl hd',
        url: 'https://icecast.walmradio.com:8443/classic',
        urlResolved: 'https://icecast.walmradio.com:8443/classic',
        favicon: 'https://icecast.walmradio.com:8443/classic.jpg',
        country: 'The United States Of America',
        countryCode: 'US',
        languages: 'english',
        codec: 'MP3',
        bitrate: 320,
        clickCount: 412,
        hls: false,
        lastCheckOk: true,
        lastCheckTime: '2026-11-06T17:10:35Z',
        tags: [
          { key: 'big band', label: 'big band' },
          { key: 'jazz', label: 'jazz' },
          { key: 'swing', label: 'swing' },
        ],
      },
    ],
  });
});

it.each([
  ['a record without uuid', [rawStation(), rawStation({ stationuuid: undefined })]],
  ['a record with a blank uuid', [rawStation({ stationuuid: '  ' })]],
  ['a record that is not an object', [rawStation(), 'oops']],
  ['a response that is not a list', { error: 'maintenance' }],
  ['an empty body', null],
])('rejects the whole page for %s', (_case, json) => {
  expect(normalizeStationPage(json)).toEqual({ ok: false, error: expect.any(String) });
});

const firstStation = (overrides: Record<string, unknown>) => {
  const page = normalizeStationPage([rawStation(overrides)]);
  if (!page.ok) throw new Error(page.error);
  return page.stations[0];
};

it.each([
  ['\tRadio  Café\u0007 Ñandú ', 'Radio Café Ñandú', 'radio cafe nandu'],
  ['   ', 'Unnamed station', 'unnamed station'],
  [undefined, 'Unnamed station', 'unnamed station'],
])('cleans the name %j for display and search', (name, display, searchKey) => {
  expect(firstStation({ name })).toMatchObject({ name: display, searchKey });
});

it.each([
  [
    ' Jazz , jazz,Smooth   Jazz,, ',
    [
      { key: 'jazz', label: 'Jazz' },
      { key: 'smooth jazz', label: 'Smooth Jazz' },
    ],
  ],
  ['', []],
  [undefined, []],
  [null, []],
])('groups the tags %j once per normalized key', (tags, expected) => {
  expect(firstStation({ tags }).tags).toEqual(expected);
});

it('falls back safely when optional fields are missing, null or malformed', () => {
  const page = normalizeStationPage([
    { stationuuid: 'u-1', url: 'http://radio.example/live', bitrate: 'fast', clickcount: null, hls: null, languagecodes: null },
  ]);

  expect(page).toEqual({
    ok: true,
    stations: [
      {
        uuid: 'u-1',
        name: 'Unnamed station',
        searchKey: 'unnamed station',
        url: 'http://radio.example/live',
        urlResolved: '',
        favicon: null,
        country: '',
        countryCode: '',
        languages: '',
        codec: '',
        bitrate: 0,
        clickCount: 0,
        hls: false,
        lastCheckOk: false,
        lastCheckTime: null,
        tags: [],
      },
    ],
  });
});

it.each(['', 'javascript:alert(1)', 'data:image/png;base64,AAAA', 'not a url'])(
  'drops the unusable favicon %j',
  (favicon) => {
    expect(firstStation({ favicon }).favicon).toBeNull();
  },
);
