/**
 * Read what the user typed into a filter box.
 * @param filter - What was typed.
 * @returns It trimmed and lowercased, which is what a match is made against.
 * @example
 * filterNeedle('  GlcNAc '); // 'glcnac'
 */
export function filterNeedle(filter: string): string {
  return filter.trim().toLowerCase();
}

/**
 * Whether any of the things an entry is known by carries what was typed.
 *
 * Every list the editor filters is filtered the same way — case-insensitively,
 * on a substring, across the few fields an entry is recognised by — so a
 * residue, a template and a symbol all answer to the same test.
 * @param needle - The filter, already through `filterNeedle`.
 * @param values - What the entry is known by; an absent one never matches.
 * @returns Whether the entry is worth showing, always true for an empty filter.
 * @example
 * matchesNeedle('nac', 'GlcNAc', 'N-acetylglucosamine'); // true
 */
export function matchesNeedle(
  needle: string,
  ...values: ReadonlyArray<string | undefined>
): boolean {
  if (needle === '') return true;
  for (const value of values) {
    if (value?.toLowerCase().includes(needle)) return true;
  }
  return false;
}
