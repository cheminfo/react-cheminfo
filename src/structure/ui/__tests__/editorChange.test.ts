import { Molecule } from 'openchemlib';
import type {
  CanvasEditorOnChangeMolecule,
  CanvasEditorOnChangeReaction,
} from 'react-ocl';
import { expect, test } from 'vitest';

import { moleculeChange, reactionChange } from '../editorChange.ts';

/**
 * An event shaped like react-ocl's, over a molecule standing in for the canvas.
 * @param drawn - What the canvas holds.
 * @returns The event.
 */
function moleculeEvent(drawn: Molecule): CanvasEditorOnChangeMolecule {
  return {
    getIdcode: () => drawn.getIDCode(),
    getMolfile: () => drawn.toMolfile(),
    getMolfileV3: () => drawn.toMolfileV3(),
    getSmiles: () => drawn.toIsomericSmiles(),
    getMolecule: () => drawn.getCompactCopy(),
  };
}

test('a molecule change carries the molecule with the notations', () => {
  const drawn = Molecule.fromSmiles('CCO');
  const change = moleculeChange(moleculeEvent(drawn));

  expect(change.mode).toBe('molecule');
  expect(change.idCode).toBe(drawn.getIDCode());
  expect(change.smiles).toBe('CCO');
  expect(change.molfile).toContain('V2000');
  expect(change.molecule.getMolecularFormula().formula).toBe('C2H6O');
});

test('the molecule is read at the edit, not when the change is used', () => {
  const drawn = Molecule.fromSmiles('CCO');
  const change = moleculeChange(moleculeEvent(drawn));

  // The canvas goes on being edited while the debounce holds the change.
  drawn.addAtom(7);

  expect(change.molecule.getAllAtoms()).toBe(3);
  expect(change.molecule.getMolecularFormula().formula).toBe('C2H6O');
});

test('a reaction change names its RXN file as the molfile', () => {
  const event: CanvasEditorOnChangeReaction = {
    getIdcode: () => 'reaction idcode',
    getRxn: () => '$RXN',
    getRxnV3: () => '$RXN V3000',
    getSmiles: () => 'CC>>CO',
  };

  expect(reactionChange(event)).toStrictEqual({
    mode: 'reaction',
    idCode: 'reaction idcode',
    molfile: '$RXN',
    smiles: 'CC>>CO',
  });
});
