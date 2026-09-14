import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import { applyAtomLabels, customAtomLabel } from '../atomLabels.ts';

test('a label beside the symbol carries the marker openchemlib reads', () => {
  expect(customAtomLabel('12')).toBe(']12');
  expect(customAtomLabel('12', 'beside')).toBe(']12');
  expect(customAtomLabel('R', 'instead')).toBe('R');
});

test('labels are written on the atoms they are keyed by', () => {
  const molecule = Molecule.fromSmiles('CCO');

  const written = applyAtomLabels(
    molecule,
    new Map([
      [0, '1'],
      [2, '3'],
    ]),
  );

  expect(written).toBe(2);
  expect(molecule.getAtomCustomLabel(0)).toBe(']1');
  expect(molecule.getAtomCustomLabel(1)).toBeNull();
  expect(molecule.getAtomCustomLabel(2)).toBe(']3');
});

test('a label can replace the symbol', () => {
  const molecule = Molecule.fromSmiles('CCO');

  applyAtomLabels(molecule, new Map([[2, 'X']]), 'instead');

  expect(molecule.getAtomCustomLabel(2)).toBe('X');
});

test('an empty text and an atom the molecule does not hold are skipped', () => {
  const molecule = Molecule.fromSmiles('CCO');

  const written = applyAtomLabels(
    molecule,
    new Map([
      [1, ''],
      [3, 'far'],
      [-1, 'before'],
      [0.5, 'between'],
    ]),
  );

  expect(written).toBe(0);
  expect(molecule.getAtomCustomLabel(0)).toBeNull();
  expect(molecule.getAtomCustomLabel(1)).toBeNull();
  expect(molecule.getAtomCustomLabel(2)).toBeNull();
});
