/**
 * What the structure editor reports after an edit.
 *
 * Only types are imported from react-ocl and openchemlib, so this module can be
 * reached from the `react-cheminfo/structure` barrel without pulling either in.
 */

import type { Molecule } from 'openchemlib';
import type {
  CanvasEditorOnChangeMolecule,
  CanvasEditorOnChangeReaction,
} from 'react-ocl';

/** What the editor draws: one structure, or a reaction with its arrow. */
export type StructureEditorMode = 'molecule' | 'reaction';

/** The notations every change carries, whichever the editor. */
interface StructureEditorNotations {
  /**
   * The idCode, with the coordinates the editor laid out written after a
   * space. `splitIdCode` takes the two apart.
   */
  idCode: string;
  /** The V2000 molfile of a molecule, or the RXN file of a reaction. */
  molfile: string;
  /** The SMILES of a molecule, or the reaction SMILES. */
  smiles: string;
}

/** What a molecule editor holds at the moment it changed. */
export interface StructureEditorMoleculeChange extends StructureEditorNotations {
  mode: 'molecule';
  /**
   * A copy of the drawn molecule, with its coordinates. It is taken when the
   * edit happens, so it still describes that edit when it arrives after the
   * debounce, and the caller may modify it without touching the canvas.
   */
  molecule: Molecule;
}

/** What a reaction editor holds at the moment it changed. */
export interface StructureEditorReactionChange extends StructureEditorNotations {
  mode: 'reaction';
}

/** Everything the editor holds at the moment it changed. */
export type StructureEditorChange =
  StructureEditorMoleculeChange | StructureEditorReactionChange;

/**
 * Read a molecule editor's event out, while it still describes the edit.
 * @param event - The event react-ocl passes to its callback.
 * @returns The change, independent of the editor from then on.
 */
export function moleculeChange(
  event: CanvasEditorOnChangeMolecule,
): StructureEditorMoleculeChange {
  return {
    mode: 'molecule',
    idCode: event.getIdcode(),
    molfile: event.getMolfile(),
    smiles: event.getSmiles(),
    molecule: event.getMolecule(),
  };
}

/**
 * Read a reaction editor's event out, while it still describes the edit.
 * @param event - The event react-ocl passes to its callback.
 * @returns The change, independent of the editor from then on.
 */
export function reactionChange(
  event: CanvasEditorOnChangeReaction,
): StructureEditorReactionChange {
  return {
    mode: 'reaction',
    idCode: event.getIdcode(),
    molfile: event.getRxn(),
    smiles: event.getSmiles(),
  };
}
