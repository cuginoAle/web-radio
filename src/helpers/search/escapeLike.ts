/** Makes `%`, `_` and the escape character literal in a LIKE ... ESCAPE '\' pattern. */
export const escapeLike = (text: string): string => text.replace(/[\\%_]/g, '\\$&');
