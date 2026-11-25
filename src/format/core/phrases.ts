/**
 * The phrases of a text, each after the first carrying the separator before
 * it, with where it starts.
 * @param text - The text.
 * @param separator - What joins two phrases.
 * @returns The phrases, which joined give the text back.
 */
export function phrasesOf(
  text: string,
  separator: string,
): Array<{ at: number; text: string }> {
  const phrases: Array<{ at: number; text: string }> = [];
  let start = 0;
  while (start <= text.length) {
    const next = separator === '' ? -1 : text.indexOf(separator, start + 1);
    const end = next === -1 ? text.length : next;
    phrases.push({ at: start, text: text.slice(start, end) });
    if (next === -1) break;
    start = next;
  }
  return phrases;
}
