import { Molecule } from 'openchemlib';

import { isEmptyIdCode, splitIdCode } from './editorValue.ts';

/**
 * The molecule an editor's value describes, its drawing kept.
 * @param value - The editor value, an idCode with its coordinates or not.
 * @returns The molecule, or `null` when nothing was drawn.
 */
export function editorMolecule(value: string): Molecule | null {
  if (isEmptyIdCode(value)) return null;
  const { idCode, coordinates } = splitIdCode(value);
  return Molecule.fromIDCode(idCode, coordinates);
}
