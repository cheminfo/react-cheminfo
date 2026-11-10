/**
 * The letter of a row of a series, in the order rows are lettered: `a` to
 * `z`, then `aa`, as a chemist runs past the alphabet.
 * @param index - The row's place, from 0.
 * @returns Its letter.
 */
export function seriesLetter(index: number): string {
  let rest = index + 1;
  let text = '';
  while (rest > 0) {
    const digit = (rest - 1) % 26;
    text = String.fromCodePoint(97 + digit) + text;
    rest = Math.floor((rest - 1) / 26);
  }
  return text;
}
