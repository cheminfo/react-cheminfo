/**
 * Text written in the Symbol font, read as the characters it shows: a file
 * from ChemDraw or Word writes `a` in Symbol for α, and `®` for →.
 */

import { codePoint } from 'dingbat-to-unicode';

/** Where Windows' Symbol font keeps the same characters, 0xF000 higher. */
const PRIVATE_OFFSET = 0xf000;

/**
 * The text a run set in the Symbol font shows, in Unicode: its letters
 * Greek, its signs and arrows as they are drawn. A character Symbol does not
 * draw stays as it is.
 * @param text - The run's text, as the file stores it.
 * @returns What the run shows.
 */
export function symbolFontToUnicode(text: string): string {
  let result = '';
  for (const character of text) result += symbolCharacter(character);
  return result;
}

/**
 * The text with its Latin letters made Greek, as setting them in the Symbol
 * font does: `a` gives α, `D` gives Δ, `q` gives θ. Every other character
 * stays as it is.
 * @param text - The text.
 * @returns The text with Greek letters.
 */
export function latinToGreek(text: string): string {
  let result = '';
  for (const character of text) {
    result += isLatinLetter(character) ? symbolCharacter(character) : character;
  }
  return result;
}

/**
 * Whether a text holds a Latin letter, which {@link latinToGreek} would make
 * Greek.
 * @param text - The text.
 * @returns Whether it holds one.
 */
export function hasLatinLetter(text: string): boolean {
  for (const character of text) {
    if (isLatinLetter(character)) return true;
  }
  return false;
}

function symbolCharacter(character: string): string {
  let code = character.codePointAt(0) ?? 0;
  if (code >= PRIVATE_OFFSET + 0x20 && code <= PRIVATE_OFFSET + 0xff) {
    code -= PRIVATE_OFFSET;
  }
  return codePoint('Symbol', code)?.string ?? character;
}

function isLatinLetter(character: string): boolean {
  return (
    (character >= 'a' && character <= 'z') ||
    (character >= 'A' && character <= 'Z')
  );
}
