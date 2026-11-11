import { createRadioBrowserClient } from '@/services/radio-browser/createRadioBrowserClient';
import { createFakeFetch, hang, json } from '@test/fakes/fakeFetch';
import { rawStation } from '@test/fixtures/radioBrowserStation';

const setup = (replies: Parameters<typeof createFakeFetch>[0] = []) => {
  const fake = createFakeFetch(replies);
  const client = createRadioBrowserClient({ fetch: fake.fetch, userAgent: 'WebRadio/1.0.0' });
  return { ...fake, client };
};

afterEach(() => jest.useRealTimers());

it('downloads a page of stations over HTTPS with a descriptive User-Agent', async () => {
  const { client, requests } = setup([json([rawStation()])]);

  const page = await client.fetchStationsPage('de1.api.radio-browser.info', 2000, 1000);

  expect(page).toEqual([rawStation()]);
  expect(requests).toHaveLength(1);
  const url = new URL(requests[0].url);
  expect(url.origin).toBe('https://de1.api.radio-browser.info');
  expect(url.pathname).toBe('/json/stations');
  expect(Object.fromEntries(url.searchParams)).toEqual({
    order: 'name',
    reverse: 'false',
    hidebroken: 'false',
    offset: '2000',
    limit: '1000',
  });
  expect(requests[0].headers['User-Agent']).toBe('WebRadio/1.0.0');
});

it('retries a transient failure once on the same mirror after a short wait', async () => {
  jest.useFakeTimers();
  const { client, requests } = setup([json('busy', 503), json([rawStation()])]);

  const page = client.fetchStationsPage('de1.api.radio-browser.info', 0, 1000);
  await jest.advanceTimersByTimeAsync(2_000);

  await expect(page).resolves.toEqual([rawStation()]);
  expect(requests.map((r) => new URL(r.url).host)).toEqual([
    'de1.api.radio-browser.info',
    'de1.api.radio-browser.info',
  ]);
});

it('gives up after the single retry with a server error', async () => {
  jest.useFakeTimers();
  const { client, requests } = setup([json('busy', 503), json('down', 500)]);

  const page = client.fetchStationsPage('de1.api.radio-browser.info', 0, 1000);
  const outcome = expect(page).rejects.toMatchObject({ kind: 'server' });
  await jest.advanceTimersByTimeAsync(2_000);

  await outcome;
  expect(requests).toHaveLength(2);
});

it('times out a hung request after 30 s, retries once, then reports a network error', async () => {
  jest.useFakeTimers();
  const { client, requests } = setup([hang, hang]);

  const page = client.fetchStationsPage('de1.api.radio-browser.info', 0, 1000);
  const outcome = expect(page).rejects.toMatchObject({ kind: 'network' });
  await jest.advanceTimersByTimeAsync(29_999);
  expect(requests).toHaveLength(1);
  await jest.advanceTimersByTimeAsync(1 + 2_000 + 30_000);

  await outcome;
  expect(requests).toHaveLength(2);
});

it('reports a response that is not JSON as invalid, without retrying', async () => {
  const { client, requests } = setup([new Response('<html>maintenance</html>', { status: 200 })]);

  await expect(client.fetchStationsPage('de1.api.radio-browser.info', 0, 1000)).rejects.toMatchObject({
    kind: 'invalid',
  });
  expect(requests).toHaveLength(1);
});

it.each([
  ['while the request is in flight', [hang], 1_000],
  ['while waiting to retry', [json('busy', 503)], 1_000],
])('stops at once when the user cancels %s', async (_when, replies, cancelAfterMs) => {
  jest.useFakeTimers();
  const { client, requests } = setup(replies);
  const cancel = new AbortController();

  const page = client.fetchStationsPage('de1.api.radio-browser.info', 0, 1000, cancel.signal);
  const outcome = expect(page).rejects.toMatchObject({ kind: 'aborted' });
  await jest.advanceTimersByTimeAsync(cancelAfterMs);
  cancel.abort();
  await jest.advanceTimersByTimeAsync(0);

  await outcome;
  await jest.advanceTimersByTimeAsync(60_000);
  expect(requests).toHaveLength(1);
});

it('lists at most three mirrors: last good one first, then the announced ones', async () => {
  const { client, requests } = setup([
    json([
      { name: 'de1.api.radio-browser.info', ip: '91.98.4.78' },
      { name: 'de1.api.radio-browser.info', ip: '2a01:4f8::1' },
      { name: 'evil host/../x', ip: '1.2.3.4' },
      { name: 'fi1.api.radio-browser.info', ip: '5.6.7.8' },
      { name: 'at1.api.radio-browser.info', ip: '5.6.7.9' },
    ]),
  ]);

  await expect(client.findMirrors('nl1.api.radio-browser.info')).resolves.toEqual([
    'nl1.api.radio-browser.info',
    'de1.api.radio-browser.info',
    'fi1.api.radio-browser.info',
  ]);
  expect(new URL(requests[0].url).href).toBe('https://nl1.api.radio-browser.info/json/servers');
});

it('falls back to the built-in mirrors when no server list is reachable', async () => {
  const offline = new TypeError('Network request failed');
  const { client } = setup([offline, offline]);

  await expect(client.findMirrors(null)).resolves.toEqual([
    'de1.api.radio-browser.info',
    'all.api.radio-browser.info',
  ]);
});

it('reports a station click once, never failing or retrying', async () => {
  const { client, requests } = setup([new TypeError('Network request failed')]);

  await expect(client.reportClick('de1.api.radio-browser.info', 'uuid-1')).resolves.toBeUndefined();
  expect(requests.map((r) => r.url)).toEqual(['https://de1.api.radio-browser.info/json/url/uuid-1']);
  expect(requests[0].headers['User-Agent']).toBe('WebRadio/1.0.0');
});
