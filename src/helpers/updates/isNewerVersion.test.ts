import { isNewerVersion } from '@/helpers/updates/isNewerVersion';

it.each([
  ['0.0.5', '0.0.4', true],
  ['0.1.0', '0.0.9', true],
  ['1.0.0', '0.9.9', true],
  ['0.0.10', '0.0.9', true], // numbers, not strings
  ['0.0.4', '0.0.4', false],
  ['0.0.3', '0.0.4', false],
  ['2.0.0', '10.0.0', false],
])('%s is newer than %s: %s', (candidate, installed, expected) => {
  expect(isNewerVersion(candidate, installed)).toBe(expected);
});

it.each(['', 'latest', '1.2', '1.2.3.4', '1.2.x', '1.2.3-beta', 'v1.2.3', ' 1.2.3'])('treats "%s" as not newer', (garbage) => {
  expect(isNewerVersion(garbage, '0.0.1')).toBe(false);
});

it('treats an unparseable installed version as nothing to compare against', () => {
  expect(isNewerVersion('1.0.0', 'unknown')).toBe(false);
});
