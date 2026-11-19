import { expect, test } from 'vitest';

import { crystalCellAtoms } from '../cellAtoms.ts';

import { crystalFile } from './crystalFile.ts';

test('aspirin: four molecules of 21 atoms fill the cell of P2₁/c', () => {
  const cell = crystalCellAtoms(crystalFile('7050902.cif'));

  expect(cell.operations).toHaveLength(4);
  expect(cell.atoms).toHaveLength(84);
  expect(cell.count).toBe(84);
  expect(cell.tooLarge).toBe(false);
});

test('diamond: the eight atoms of the face-centred cell', () => {
  const cell = crystalCellAtoms(crystalFile('9008564.cif'));

  expect(cell.atoms).toHaveLength(8);
  expect(cell.lattice.cell.a).toBeCloseTo(3.5668, 4);
});

test('a cell above the cap is counted and not returned', () => {
  const cell = crystalCellAtoms(crystalFile('7050902.cif'), { maxAtoms: 50 });

  expect(cell.atoms).toStrictEqual([]);
  expect(cell.count).toBe(84);
  expect(cell.tooLarge).toBe(true);
});
