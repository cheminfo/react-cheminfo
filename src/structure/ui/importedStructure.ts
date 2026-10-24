/**
 * Read a structure dropped on the editor, or opened from disk.
 *
 * **Not exported from `ui/index.ts`**: it value-imports `openchemlib`. The
 * editor loads it on the first drop, by which time the canvas has already
 * brought openchemlib in.
 */

import { Canonizer, Molecule } from 'openchemlib';

import { splitEditorValue } from '../core/editorValue.ts';

import type { StructureEditorMoleculeChange } from './editorChange.ts';

/**
 * Turn dropped text into what the editor reports after an edit.
 *
 * A molfile is read whole, so an SDF gives its first record. Anything else is
 * read from its first meaningful line, as a SMILES and then as an idCode — but
 * an idCode only when it is the canonical one, because openchemlib decodes
 * almost any word into some molecule: `ethanol` read as an idCode has 1106
 * atoms. A word holding a character no idCode holds is never decoded, since
 * openchemlib does not return from some of them — `O=Cc1cccc`, a SMILES with
 * an unclosed ring, is one. A 3D structure is laid out flat, since the canvas
 * draws in 2D.
 * @param text - The file's content or the dragged text.
 * @param fragment - Whether the editor draws a query fragment.
 * @returns The change, or `null` when the text holds no structure.
 */
export function readImportedStructure(
  text: string,
  fragment: boolean,
): StructureEditorMoleculeChange | null {
  const molecule = parseStructure(text);
  if (molecule === null || molecule.getAllAtoms() === 0) return null;
  if (hasDepth(molecule)) molecule.inventCoordinates();
  molecule.setFragment(fragment);

  const canonizer = new Canonizer(molecule);
  return {
    mode: 'molecule',
    idCode: `${canonizer.getIDCode()} ${canonizer.getEncodedCoordinates(false)}`,
    molfile: molecule.toMolfile(),
    smiles: molecule.toIsomericSmiles(),
    molecule: molecule.getCompactCopy(),
  };
}

function parseStructure(text: string): Molecule | null {
  const value = splitEditorValue(text);
  if (value.kind === 'molfile') {
    return attempt(() => Molecule.fromMolfile(value.molfile));
  }
  const notation = value.entries[0]?.structure;
  if (notation === undefined) return null;
  return (
    attempt(() => Molecule.fromSmiles(notation)) ?? canonicalIdCode(notation)
  );
}

function canonicalIdCode(text: string): Molecule | null {
  if (!ID_CODE.test(text)) return null;
  const molecule = attempt(() => Molecule.fromIDCode(text));
  return molecule?.getIDCode() === text ? molecule : null;
}

function attempt(parse: () => Molecule): Molecule | null {
  try {
    return parse();
  } catch {
    return null;
  }
}

function hasDepth(molecule: Molecule): boolean {
  for (let atom = 0; atom < molecule.getAllAtoms(); atom++) {
    if (molecule.getAtomZ(atom) !== 0) return true;
  }
  return false;
}

/** An idCode is written in six-bit groups offset to `@`, so in `@` to DEL. */
const ID_CODE = /^[\u0040-\u007F]+$/;
