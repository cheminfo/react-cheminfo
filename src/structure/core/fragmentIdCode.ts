/**
 * A SMILES turned into the idCode a query editor holds.
 *
 * **Not exported from `core/index.ts`**: it value-imports `openchemlib`, so
 * the structure search dialog loads it with a dynamic import, only once an
 * example is clicked.
 */

import { Molecule } from 'openchemlib';

/**
 * Read a SMILES as a query fragment.
 * @param smiles - The fragment.
 * @returns Its idCode, flagged as a fragment so any substituent may hang off
 * it; empty when the SMILES cannot be read.
 */
export function fragmentIdCode(smiles: string): string {
  try {
    const fragment = Molecule.fromSmiles(smiles);
    fragment.setFragment(true);
    return fragment.getIDCode();
  } catch {
    return '';
  }
}
