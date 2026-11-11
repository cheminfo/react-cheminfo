/**
 * A structure a host handed over: the kinds it arrives as, and the notation it
 * is drawn from.
 *
 * Every tool of the family that takes a structure takes it the same way — in
 * the three notations a notebook keeps, the one that says the most first — so
 * the kinds are written once, here. Reading one into a molecule needs
 * OpenChemLib, so that half is `./hostMolecule.ts`, behind the
 * `react-cheminfo/structure` door: a tool that takes no structure, importing
 * `react-cheminfo/host`, never puts OpenChemLib in its build.
 */

import type { StructureSource } from '../../structure/core/structureSource.ts';

import type { CheckedValue } from './kinds.ts';

/**
 * The kinds a structure input accepts, in order of preference: a molfile
 * carries the layout its author drew, an idcode the exact structure, a SMILES
 * only the connectivity.
 */
export const STRUCTURE_KINDS = [
  'chem.molfile',
  'chem.ocl.id',
  'chem.smiles',
] as const;

/** A checked value holding a structure. */
export type StructureValue = Extract<
  CheckedValue,
  { kind: (typeof STRUCTURE_KINDS)[number] }
>;

/**
 * A structure a host sent, as the notation a depiction is drawn from.
 * @param checked - The value, already checked against its kind.
 * @returns The notation and its text; an idcode keeps its coordinates.
 */
export function hostStructureSource(checked: StructureValue): StructureSource {
  if (checked.kind === 'chem.molfile') {
    return { kind: 'molfile', value: checked.value.molfile };
  }
  if (checked.kind === 'chem.ocl.id') {
    const { idCode, coordinates } = checked.value;
    return coordinates === ''
      ? { kind: 'idcode', value: idCode }
      : { kind: 'idcode', value: idCode, coordinates };
  }
  return { kind: 'smiles', value: checked.value.smiles.trim() };
}

/** What each structure kind is called in a sentence. */
export const STRUCTURE_NOTATIONS: Record<StructureValue['kind'], string> = {
  'chem.molfile': 'molfile',
  'chem.ocl.id': 'idcode',
  'chem.smiles': 'SMILES',
};

/**
 * Whether a checked value holds a structure.
 * @param checked - The value, already checked against its kind.
 * @returns Whether it is one of `STRUCTURE_KINDS`.
 */
export function isStructureValue(
  checked: CheckedValue,
): checked is StructureValue {
  return Object.hasOwn(STRUCTURE_NOTATIONS, checked.kind);
}
