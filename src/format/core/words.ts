/**
 * The noun that agrees with a count.
 *
 * Only the noun comes back, never the number, so the caller decides how the
 * count itself is written: `${formatInteger(n)} ${pluralize(n, 'structure')}`.
 * @param count - How many there are.
 * @param singular - The noun for exactly one.
 * @param plural - The noun for any other count. Defaults to the singular with an `s`.
 * @returns The singular for a count of one, the plural otherwise.
 */
export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return count === 1 ? singular : plural;
}
