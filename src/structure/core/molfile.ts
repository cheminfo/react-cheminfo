/** Which connection-table dialect a molfile is written in. */
export type MolfileVersion = 'v2000' | 'v3000' | 'unknown';

/** What a molfile's counts line says about it. */
export interface MolfileClassification {
  /** The dialect, `unknown` when the text carries no version stamp. */
  version: MolfileVersion;
  /**
   * Atoms the counts line declares, `0` when there is no counts line to read.
   */
  atomCount: number;
}

/**
 * Read a molfile's version and its declared atom count.
 *
 * The two dialects write their counts in unrelated places: V2000 packs them
 * into the fixed-width fields of the line ending in `V2000`, while a V3000
 * file leaves those fields at zero and declares the real counts on an
 * `M  V30 COUNTS` line further down. Reading a V3000 file with the V2000 rule
 * therefore answers zero atoms without failing, which is what makes a viewer
 * render an empty scene and report nothing.
 * @param text - A molfile, or any text that may not be one.
 * @returns The dialect and the declared atom count.
 */
export function classifyMolfile(text: string): MolfileClassification {
  if (V3000_STAMP.test(text)) {
    return { version: 'v3000', atomCount: countIn(text, V3000_COUNTS) };
  }
  if (V2000_STAMP.test(text)) {
    return { version: 'v2000', atomCount: countIn(text, V2000_COUNTS) };
  }
  return { version: 'unknown', atomCount: 0 };
}

/**
 * How many atoms a molfile declares, whichever dialect it is written in.
 * @param text - A molfile, or any text that may not be one.
 * @returns The declared atom count, `0` when the text declares none.
 */
export function molfileAtomCount(text: string): number {
  return classifyMolfile(text).atomCount;
}

/**
 * Whether a piece of text should be read as a molfile rather than as a line
 * notation.
 *
 * A line notation is a single line and can never carry a version stamp, so a
 * text holding a header, a counts line and at least one atom line is the one
 * that is a molfile.
 * @param text - The structure, as typed, pasted or dropped.
 * @returns True when it should be read as a molfile.
 */
export function looksLikeMolfile(text: string): boolean {
  if (countLines(text) < 4) return false;
  return classifyMolfile(text).version !== 'unknown';
}

/**
 * The version stamp closes a line whose every other field is a number, so a
 * data field or a sentence mentioning the dialect is not mistaken for one.
 */
const V2000_STAMP = /^[\d ]+V2000[^\S\n]*$/m;
const V3000_STAMP = /^[\d ]+V3000[^\S\n]*$/m;

/**
 * The V2000 counts line is fixed-width: three characters for the atoms, three
 * for the bonds. A writer that trims the padding still lands inside the same
 * six characters for any count a V2000 file can hold.
 */
const V2000_COUNTS = /^(?<atoms>[\d ]{3})[\d ]*V2000[^\S\n]*$/m;
const V3000_COUNTS = /^M {2}V30 COUNTS +(?<atoms>\d+)/m;

function countIn(text: string, pattern: RegExp): number {
  const atoms = pattern.exec(text)?.groups?.atoms;
  if (atoms === undefined) return 0;
  const count = Number.parseInt(atoms.trim(), 10);
  return Number.isFinite(count) && count > 0 ? count : 0;
}

function countLines(text: string): number {
  let lines = 1;
  let index = text.indexOf('\n');
  while (index !== -1) {
    lines++;
    index = text.indexOf('\n', index + 1);
  }
  return lines;
}
