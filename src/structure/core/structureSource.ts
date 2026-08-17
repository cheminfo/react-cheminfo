import { isEmptyIdCode, splitIdCode } from './editorValue.ts';
import { molfileAtomCount } from './molfile.ts';

/** Every notation a read-only depiction may be handed. */
export interface StructureSourceInput {
  /** A canonical openchemlib idCode, coordinates included or not. */
  idCode?: string;
  /** Encoded 2D coordinates, when they did not travel with the idCode. */
  coordinates?: string;
  /** A molfile, V2000 or V3000. */
  molfile?: string;
  /** A SMILES. */
  smiles?: string;
}

/** The one notation a depiction should be drawn from. */
export interface StructureSource {
  /** Which notation was picked; `empty` when none of them holds a structure. */
  kind: 'idcode' | 'molfile' | 'smiles' | 'empty';
  /** The text to draw, empty when there is nothing to draw. */
  value: string;
  /** Encoded 2D coordinates, only ever set beside an idCode. */
  coordinates?: string;
}

/**
 * Pick the notation a depiction is drawn from when several were supplied.
 *
 * The most exact one wins: an idCode says precisely which structure, a molfile
 * additionally carries the layout its author chose, and a SMILES leaves the
 * layout to be invented. A notation that describes nothing — a blank string, a
 * molfile with an empty atom block, the idCode an erased canvas leaves behind
 * — is skipped rather than drawn, which is what turns a broken box into the
 * next best picture, or into an honest placeholder.
 * @param input - Whatever notations the caller has.
 * @returns The notation to draw, and the text to draw it from.
 */
export function structureSource(input: StructureSourceInput): StructureSource {
  const { idCode, coordinates, molfile, smiles } = input;

  if (idCode !== undefined && !isEmptyIdCode(idCode)) {
    const split = splitIdCode(idCode);
    const layout = split.coordinates ?? coordinates;
    return layout === undefined || layout === ''
      ? { kind: 'idcode', value: split.idCode }
      : { kind: 'idcode', value: split.idCode, coordinates: layout };
  }

  if (molfile !== undefined && molfileAtomCount(molfile) > 0) {
    return { kind: 'molfile', value: molfile };
  }

  const line = smiles?.trim() ?? '';
  if (line !== '') return { kind: 'smiles', value: line };

  return { kind: 'empty', value: '' };
}
