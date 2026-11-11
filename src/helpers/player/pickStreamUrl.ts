const isHttp = (url: string) => /^https?:\/\/\S+$/i.test(url);

/** Prefer the directory-resolved URL; only http(s) is ever handed to the player. */
export const pickStreamUrl = ({ url, urlResolved }: { url: string; urlResolved: string }): string | null =>
  isHttp(urlResolved) ? urlResolved : isHttp(url) ? url : null;
