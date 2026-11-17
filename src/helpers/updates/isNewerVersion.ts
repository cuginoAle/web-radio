const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

const parse = (version: string) => SEMVER.exec(version)?.slice(1).map(Number);

/** MAJOR.MINOR.PATCH only: anything else (pre-release tags, garbage) is never newer. */
export function isNewerVersion(candidate: string, installed: string) {
  const a = parse(candidate);
  const b = parse(installed);
  if (!a || !b) return false;
  const differing = a.findIndex((part, i) => part !== b[i]);
  return differing !== -1 && a[differing] > b[differing];
}
