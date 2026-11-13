/** Splits a list into rows of two; the last row has one item when the count is odd. */
export function pairs<T>(items: T[]): T[][] {
  return Array.from({ length: Math.ceil(items.length / 2) }, (_, i) => items.slice(i * 2, i * 2 + 2));
}
