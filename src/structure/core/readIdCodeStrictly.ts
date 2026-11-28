import { Molecule } from 'openchemlib';

import { readCanonicalIdCode } from './canonicalIdCode.ts';

/**
 * Read an idCode, and only an idCode, with the atom layout an editor writes
 * after it: the molecule is kept only when it writes the same idCode back.
 * Needs OpenChemLib, so it comes through `react-cheminfo/structure`.
 * @param value - An idCode, optionally followed by its coordinates.
 * @returns The molecule, or `undefined` when the value is no canonical idCode.
 */
export function readIdCodeStrictly(value: string): Molecule | undefined {
  return (
    readCanonicalIdCode(
      value,
      (idCode, coordinates) =>
        coordinates === undefined
          ? Molecule.fromIDCode(idCode)
          : Molecule.fromIDCode(idCode, coordinates),
      { coordinates: 'keep' },
    ) ?? undefined
  );
}
