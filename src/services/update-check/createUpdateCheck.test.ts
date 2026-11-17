import { prepareDatabase } from '@/db/prepareDatabase';
import { setUpdateCheckEnabled } from '@/db/queries/updateCheck';
import { createUpdateCheck } from '@/services/update-check/createUpdateCheck';
import { createFakeFetch, hang, json } from '@test/fakes/fakeFetch';
import { createNodeDb } from '@test/sqlite/nodeDb';

const DAY = 24 * 60 * 60 * 1000;
const URL = 'https://github.com/cuginoAle/web-radio/releases/download/v0.0.5/NoSpyFi-0.0.5.apk';
const latest = (tag = 'v0.0.5') =>
  json({ tag_name: tag, body: 'notes', assets: [{ name: `NoSpyFi-${tag.replace('v', '')}.apk`, browser_download_url: URL }] });

async function setup({ enabled = true, replies = [] as Parameters<typeof createFakeFetch>[0] } = {}) {
  const { db } = createNodeDb();
  await prepareDatabase(db);
  if (enabled) await setUpdateCheckEnabled(db, true);
  const fake = createFakeFetch(replies);
  const clock = { now: 1_700_000_000_000 };
  const make = (fetch: typeof fake.fetch, installedVersion = '0.0.4') =>
    createUpdateCheck({ db, fetch, userAgent: 'NoSpyFi/0.0.4', installedVersion, now: () => clock.now });
  return { db, updates: make(fake.fetch), make, clock, ...fake };
}

afterEach(() => jest.useRealTimers());

describe('check', () => {
  it('asks GitHub for the latest release with only the Accept and User-Agent headers', async () => {
    const { updates, requests } = await setup({ replies: [latest()] });

    await updates.check();

    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe('https://api.github.com/repos/cuginoAle/web-radio/releases/latest');
    expect(requests[0].headers).toEqual({ Accept: 'application/vnd.github+json', 'User-Agent': 'NoSpyFi/0.0.4' });
  });

  it('sends nothing while the setting is off', async () => {
    const { updates, requests } = await setup({ enabled: false });

    await updates.check();

    expect(requests).toEqual([]);
    expect(await updates.current()).toBeNull();
  });

  it('checks at most once a day', async () => {
    const { updates, clock, requests } = await setup({ replies: [latest(), latest()] });

    await updates.check();
    clock.now += DAY - 1;
    await updates.check();
    expect(requests).toHaveLength(1);

    clock.now += 1;
    await updates.check();
    expect(requests).toHaveLength(2);
  });

  it.each([
    ['offline', new Error('Network request failed')],
    ['not found', json({ message: 'Not Found' }, 404)],
    ['rate limited', json({ message: 'rate limit' }, 403)],
    ['bad JSON', new Response('<html>', { status: 200 })],
  ])('stays silent on %s, records the attempt and does not retry before tomorrow', async (_label, reply) => {
    const { updates, clock, requests } = await setup({ replies: [reply] });

    await expect(updates.check()).resolves.toBeUndefined();
    clock.now += DAY / 2;
    await updates.check();

    expect(requests).toHaveLength(1);
    expect(await updates.current()).toBeNull();
  });

  it('gives up on a hung request after 30 s and stays silent', async () => {
    jest.useFakeTimers();
    const { updates, requests } = await setup({ replies: [hang] });

    const done = updates.check();
    await jest.advanceTimersByTimeAsync(30_000);

    await expect(done).resolves.toBeUndefined();
    expect(requests[0].signal?.aborted).toBe(true);
  });
});

describe('current', () => {
  it('has no update before any check', async () => {
    expect(await (await setup()).updates.current()).toBeNull();
  });

  it('returns the newer release found, and keeps returning it after a restart without a new request', async () => {
    const { make, updates, clock, requests } = await setup({ replies: [latest()] });
    await updates.check();

    clock.now += 3 * 60 * 60 * 1000;
    const restarted = make(createFakeFetch().fetch); // an empty fake throws on any request
    await restarted.check();

    expect(await restarted.current()).toEqual({ version: '0.0.5', url: URL });
    expect(requests).toHaveLength(1);
  });

  it('finds nothing when the latest release is not newer', async () => {
    const { updates } = await setup({ replies: [latest('v0.0.4')] });
    await updates.check();
    expect(await updates.current()).toBeNull();
  });

  it('ignores a stored update once the installed version has caught up', async () => {
    const { make, updates } = await setup({ replies: [latest()] });
    await updates.check();

    expect(await make(createFakeFetch().fetch, '0.0.5').current()).toBeNull();
  });

  it('hides a stored update when the setting is turned off', async () => {
    const { db, updates } = await setup({ replies: [latest()] });
    await updates.check();

    await setUpdateCheckEnabled(db, false);

    expect(await updates.current()).toBeNull();
  });

  it('is snoozed for 24 h and returns after that', async () => {
    const { updates, clock } = await setup({ replies: [latest()] });
    await updates.check();

    await updates.snooze();
    expect(await updates.current()).toBeNull();
    clock.now += DAY - 1;
    expect(await updates.current()).toBeNull();
    clock.now += 1;
    expect(await updates.current()).toEqual({ version: '0.0.5', url: URL });
  });
});
