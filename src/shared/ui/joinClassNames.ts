/**
 * A `className` built from the names that apply.
 *
 * A component's own name comes first and a caller's `className` after it, so
 * the caller's rules win a tie; a name that does not apply is written as
 * `false`, `null`, `undefined` or `''` and is left out rather than leaving a
 * stray space in the markup.
 * @param names - The candidate names, in order.
 * @returns The names that apply, separated by single spaces.
 */
export function joinClassNames(
  ...names: ReadonlyArray<string | false | null | undefined>
): string {
  let joined = '';
  for (const name of names) {
    if (typeof name !== 'string' || name === '') continue;
    joined = joined === '' ? name : `${joined} ${name}`;
  }
  return joined;
}
