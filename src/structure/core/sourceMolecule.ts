/**
 * Read the notation a depiction was handed into the molecule it draws.
 *
 * **Not exported from `core/index.ts`**: it value-imports `openchemlib`, so a
 * barrel carrying it would pull the whole library into every site that imports
 * `react-cheminfo/core`. The depiction and the export dialog both load it
 * lazily, which is where openchemlib already is.
 */

import { Molecule } from 'openchemlib';

import type { StructureSource } from './structureSource.ts';

/**
 * Parse one picked notation.
 * @param source - The notation, as `structureSource` picked it.
 * @returns The molecule, which holds no atom for an empty source.
 * @throws {Error} Whatever OpenChemLib throws on a notation it cannot read.
 */
export function sourceMolecule(source: StructureSource): Molecule {
  const { kind, value, coordinates } = source;
  if (kind === 'idcode') return Molecule.fromIDCode(value, coordinates);
  if (kind === 'molfile') return Molecule.fromMolfile(value);
  if (kind === 'smiles') return Molecule.fromSmiles(value);
  return new Molecule(0, 0);
}
