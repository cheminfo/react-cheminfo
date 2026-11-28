/**
 * Reading text as an OpenChemLib idCode, and only an idCode, with the decoder
 * handed in so this module loads no OpenChemLib.
 *
 * `Molecule.fromIDCode` decodes almost any word into some molecule —
 * `ethanol` into 1106 atoms, `notanidcode` into 31 — so a word counts only
 * when the molecule writes the same idCode back. And a word holding characters
 * an idCode never holds is not decoded at all: openchemlib never returns from
 * decoding some of them.
 */

/** An idCode is written in six-bit groups offset to `@`, so in `@` to DEL. */
const ID_CODE_CHARACTERS = /^[@-\u007F]+$/;

/** What {@link readCanonicalIdCode} is given beside the text and the decoder. */
export interface CanonicalIdCodeOptions {
  /**
   * What becomes of the coordinates an editor writes after the idCode:
   * `drop` decodes the idCode alone, `keep` hands them to the decoder.
   * @default 'drop'
   */
  coordinates?: 'drop' | 'keep';
}

/**
 * Whether a word is written only with the characters of an idCode, so it may
 * be decoded without the decoder hanging on it.
 * @param word - The word, without coordinates.
 * @returns True for a non-empty run of `@` to DEL.
 */
export function isIdCodeText(word: string): boolean {
  return ID_CODE_CHARACTERS.test(word);
}

/**
 * The molecule a piece of text is, when it is a canonical idCode: alone, or
 * followed by the coordinates an editor writes after it.
 * @param text - The text, trimmed or not.
 * @param fromIDCode - The decoder: `Molecule.fromIDCode`, or a site's own.
 * @param options - What becomes of the coordinates.
 * @returns The molecule, or `null` when the text is no canonical idCode.
 */
export function readCanonicalIdCode<
  TMolecule extends { getIDCode: () => string },
>(
  text: string,
  fromIDCode: (idCode: string, coordinates?: string) => TMolecule,
  options: CanonicalIdCodeOptions = {},
): TMolecule | null {
  const [idCode = '', coordinates = ''] = text.trim().split(/\s+/);
  if (!isIdCodeText(idCode)) return null;
  let molecule: TMolecule;
  try {
    molecule =
      options.coordinates === 'keep' && coordinates !== ''
        ? fromIDCode(idCode, coordinates)
        : fromIDCode(idCode);
  } catch {
    return null;
  }
  return molecule.getIDCode() === idCode ? molecule : null;
}
