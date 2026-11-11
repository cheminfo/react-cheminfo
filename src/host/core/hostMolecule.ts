/**
 * A structure a host handed over, read into the molecule a tool works on, and
 * the sentence a host reads when it cannot be.
 *
 * The half of the host's structure handling that needs OpenChemLib, exported
 * from `react-cheminfo/structure` rather than `react-cheminfo/host`, so a tool
 * that takes no structure never puts OpenChemLib in its build.
 */

import type { Molecule } from 'openchemlib';

import { sourceMolecule } from '../../structure/core/sourceMolecule.ts';
import { structureError } from '../../structure/core/structureError.ts';

import type { LoadedInput } from './connectHost.ts';
import type { StructureValue } from './hostStructure.ts';
import {
  STRUCTURE_NOTATIONS,
  hostStructureSource,
  isStructureValue,
} from './hostStructure.ts';

/**
 * The function a tool hands `useHostConnection` as `load` when its input is a
 * structure.
 *
 * The structure is parsed before `show` is called, so one that cannot be read
 * is answered `unreadable` with a sentence the host can show, and nothing on
 * the tool's screen changes.
 * @param show - Puts the molecule on screen, under the host's label for it.
 * @param key - The input the structure arrives on.
 * @returns The `load` function.
 */
export function hostStructureLoader(
  show: (molecule: Molecule, label: string | undefined) => void,
  key = 'structure',
): (inputs: readonly LoadedInput[]) => void {
  return (inputs) => {
    for (const { key: inputKey, item, checked } of inputs) {
      if (inputKey !== key || !isStructureValue(checked)) continue;
      show(readHostMolecule(checked), item.label);
    }
  };
}

/**
 * Read a structure a host sent.
 *
 * A molfile whose atoms all sit on one point — SciPeaks stores some that way —
 * is laid out again, so a tool that draws it does not draw one dot.
 * @param checked - The value, already checked against its kind.
 * @returns A molecule with at least one atom.
 * @throws {Error} When the notation does not parse or describes no atoms; the
 * message is the sentence the host is answered with.
 */
export function readHostMolecule(checked: StructureValue): Molecule {
  const notation = STRUCTURE_NOTATIONS[checked.kind];
  let molecule: Molecule;
  try {
    molecule = sourceMolecule(hostStructureSource(checked));
  } catch (error) {
    const { message } = structureError(error);
    throw new Error(
      `The ${notation} could not be read, so nothing was loaded: ${message}`,
      { cause: error },
    );
  }
  if (molecule.getAllAtoms() === 0) {
    throw new Error(
      `The ${notation} describes no atoms, so nothing was loaded.`,
    );
  }
  if (atomsCoincide(molecule)) molecule.inventCoordinates();
  return molecule;
}

function atomsCoincide(molecule: Molecule): boolean {
  const atoms = molecule.getAllAtoms();
  if (atoms < 2) return false;
  const x = molecule.getAtomX(0);
  const y = molecule.getAtomY(0);
  for (let atom = 1; atom < atoms; atom++) {
    if (molecule.getAtomX(atom) !== x || molecule.getAtomY(atom) !== y) {
      return false;
    }
  }
  return true;
}
