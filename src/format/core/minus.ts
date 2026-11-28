/** The minus sign typeset, rather than the hyphen a keyboard types. */
export const MINUS_SIGN = '−';

/**
 * A number written with its leading hyphen typeset as a minus sign.
 * @param text - The number, written.
 * @returns It, with `−` for a leading `-`; anything else as it was.
 */
export function typesetMinus(text: string): string {
  return text.startsWith('-') ? `${MINUS_SIGN}${text.slice(1)}` : text;
}
