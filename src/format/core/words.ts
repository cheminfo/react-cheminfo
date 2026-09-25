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

/**
 * English ordinal of a position.
 *
 * Only the ordinal comes back, never the noun it counts, so the caller writes
 * the sentence: `the ${ordinal(n)} conformer produced`.
 * @param position - 1-based position.
 * @returns E.g. `1st`, `2nd`, `12th`, `23rd`.
 */
export function ordinal(position: number): string {
  const teens = position % 100;
  const suffix =
    teens >= 11 && teens <= 13
      ? 'th'
      : (ORDINAL_SUFFIXES[position % 10] ?? 'th');
  return `${position}${suffix}`;
}

const ORDINAL_SUFFIXES: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
