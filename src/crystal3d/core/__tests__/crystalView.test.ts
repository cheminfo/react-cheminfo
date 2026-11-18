import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import { crystalCellAtoms } from '../../../crystal/core/cellAtoms.ts';
import { readCif } from '../../../crystal/core/cif/read.ts';
import { covalentBondLimit } from '../../../crystal/core/covalentRadii.ts';
import { crystalView } from '../crystalView.ts';

function cellOf(name: string) {
  return crystalCellAtoms(
    readCif(
      readFileSync(
        join(import.meta.dirname, '../../../crystal/core/__tests__/data', name),
        'utf8',
      ),
    ),
  );
}

test('diamond, cut by its cell, repeated over two cells along each axis', () => {
  const { atoms, lattice } = cellOf('9008564.cif');
  const view = crystalView(atoms, lattice, {
    packing: 'cell',
    cells: 2,
    bondLimit: covalentBondLimit,
  });

  expect(view.atomsPerCell).toBe(8);
  expect(view.molecules).toBe(0);
  expect(view.cells).toBe(2);
  expect(view.atoms).toHaveLength(64);
});

test('aspirin, each of its four molecules whole', () => {
  const { atoms, lattice } = cellOf('7050902.cif');
  const view = crystalView(atoms, lattice, { bondLimit: covalentBondLimit });

  expect(view.molecules).toBe(4);
  expect(view.atomsPerCell).toBe(84);
  expect(view.cells).toBe(1);
  expect(view.extended).toBe(false);
  expect(view.atoms).toHaveLength(84);
});

test('a stack that would hold too many atoms is drawn smaller', () => {
  const { atoms, lattice } = cellOf('7050902.cif');
  const many = Array.from({ length: 60 }, () => atoms).flat();
  const view = crystalView(many, lattice, {
    packing: 'cell',
    cells: 4,
    bondLimit: covalentBondLimit,
  });

  expect(view.atomsPerCell).toBe(5040);
  expect(view.cells).toBe(1);
  expect(view.atoms).toHaveLength(5040);
});
