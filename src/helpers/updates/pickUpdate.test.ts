import { pickUpdate } from '@/helpers/updates/pickUpdate';

const apk = (name = 'NoSpyFi-0.0.5.apk', url = 'https://github.com/x/NoSpyFi-0.0.5.apk') => ({ name, browser_download_url: url });
const release = (over: Record<string, unknown> = {}) => ({ tag_name: 'v0.0.5', assets: [apk()], ...over });

it('picks the version (leading v stripped) and the https APK URL of a newer release', () => {
  expect(pickUpdate(release(), '0.0.4')).toEqual({ version: '0.0.5', url: 'https://github.com/x/NoSpyFi-0.0.5.apk' });
});

it('accepts a tag without a leading v', () => {
  expect(pickUpdate(release({ tag_name: '0.0.5' }), '0.0.4')).toMatchObject({ version: '0.0.5' });
});

it.each([
  ['same version', release({ tag_name: 'v0.0.4' })],
  ['older version', release({ tag_name: 'v0.0.3' })],
  ['garbage tag', release({ tag_name: 'nightly' })],
  ['no tag', release({ tag_name: undefined })],
  ['no assets', release({ assets: undefined })],
  ['no APK asset', release({ assets: [apk('notes.txt')] })],
  ['wrongly named APK', release({ assets: [apk('NoSpyFi-0.0.5-debug.apk')] })],
  ['APK name with a prefix', release({ assets: [apk('x-NoSpyFi-0.0.5.apk')] })],
  ['cleartext download URL', release({ assets: [apk(undefined, 'http://github.com/x/NoSpyFi-0.0.5.apk')] })],
  ['missing download URL', release({ assets: [{ name: 'NoSpyFi-0.0.5.apk' }] })],
  ['not an object', 'oops'],
  ['null', null],
])('finds no update for %s', (_label, body) => {
  expect(pickUpdate(body, '0.0.4')).toBeNull();
});

it('skips non-matching assets and uses the one that matches', () => {
  const body = release({ assets: [apk('checksums.txt'), apk('NoSpyFi-0.0.5.apk', 'https://example.com/a.apk')] });
  expect(pickUpdate(body, '0.0.4')).toEqual({ version: '0.0.5', url: 'https://example.com/a.apk' });
});
