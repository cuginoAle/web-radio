/** Case- and accent-insensitive form shared by station search keys and user queries. */
export const normalizeText = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
