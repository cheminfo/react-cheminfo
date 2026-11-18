import { XSadd } from 'ml-xsadd';
import { expect, test } from 'vitest';

import { bondGraph, walkComponents } from '../components.ts';
import { covalentBondLimit } from '../covalentRadii.ts';
import type { PackedAtom } from '../periodicBonds.ts';
import { findPeriodicBonds } from '../periodicBonds.ts';
import { createLattice, fractionalToCartesian } from '../symmetry/lattice.ts';

test('a cell shorter than a bond is searched over the cells the bond reaches', () => {
  // Simple cubic carbon, 1.5 Å apart: each atom bonded to its six neighbours.
  const lattice = createLattice({
    a: 1.5,
    b: 1.5,
    c: 1.5,
    alpha: 90,
    beta: 90,
    gamma: 90,
  });
  const atoms: PackedAtom[] = [{ element: 'C', position: [0, 0, 0] }];
  const pairs = findPeriodicBonds(atoms, lattice, covalentBondLimit);

  expect(pairs.count).toBe(3);
  expect(Array.from(pairs.shifts)).toStrictEqual([0, 0, 1, 0, 1, 0, 1, 0, 0]);
  expect(Array.from(pairs.lengths)).toStrictEqual([1.5, 1.5, 1.5]);

  const { components } = walkComponents(bondGraph(1, pairs));

  expect(components).toStrictEqual([{ atoms: [0], periodicity: 3 }]);
});

test('the grid finds exactly the bonds a search over every image finds', () => {
  const lattice = createLattice({
    a: 13.1,
    b: 9.7,
    c: 21.3,
    alpha: 71,
    beta: 103,
    gamma: 117,
  });
  const random = new XSadd(20261118).random;
  const atoms: PackedAtom[] = [];
  for (let index = 0; index < 400; index++) {
    atoms.push({
      element: index % 3 === 0 ? 'O' : 'C',
      position: [random(), random(), random()],
    });
  }
  const pairs = findPeriodicBonds(atoms, lattice, covalentBondLimit);
  const found = new Set<string>();
  for (let pair = 0; pair < pairs.count; pair++) {
    found.add(
      [
        pairs.from[pair],
        pairs.to[pair],
        pairs.shifts[pair * 3],
        pairs.shifts[pair * 3 + 1],
        pairs.shifts[pair * 3 + 2],
      ].join(' '),
    );
  }

  expect(found.size).toBe(pairs.count);
  expect(found).toStrictEqual(bruteForce(atoms, lattice));
});

test('atoms closer than the same-place distance are listed, not bonded', () => {
  const lattice = createLattice({
    a: 10,
    b: 10,
    c: 10,
    alpha: 90,
    beta: 90,
    gamma: 90,
  });
  const atoms: PackedAtom[] = [
    { element: 'C', position: [0.999, 0.5, 0.5] },
    { element: 'C', position: [0.001, 0.5, 0.5] },
    { element: 'C', position: [0.14, 0.5, 0.5] },
  ];
  const pairs = findPeriodicBonds(atoms, lattice, covalentBondLimit, {
    samePlace: 0.5,
  });

  expect(Array.from(pairs.coincident)).toStrictEqual([0, 1]);
  expect(Array.from(pairs.from)).toStrictEqual([0, 1]);
  expect(Array.from(pairs.to)).toStrictEqual([2, 2]);
  expect(Array.from(pairs.shifts)).toStrictEqual([1, 0, 0, 0, 0, 0]);
});

/**
 * Every bond, by comparing each pair over 125 cells.
 * @param atoms - The atoms of one cell.
 * @param lattice - The cell.
 * @returns Each bond as `from to a b c`.
 */
function bruteForce(
  atoms: readonly PackedAtom[],
  lattice: ReturnType<typeof createLattice>,
): Set<string> {
  const bonds = new Set<string>();
  for (let i = 0; i < atoms.length; i++) {
    const a = atoms[i] as PackedAtom;
    const from = fractionalToCartesian(lattice, a.position);
    for (let j = i; j < atoms.length; j++) {
      const b = atoms[j] as PackedAtom;
      const limit = covalentBondLimit(a.element, b.element);
      for (let sa = -2; sa <= 2; sa++) {
        for (let sb = -2; sb <= 2; sb++) {
          for (let sc = -2; sc <= 2; sc++) {
            const positive =
              sa > 0 || (sa === 0 && (sb > 0 || (sb === 0 && sc > 0)));
            if (j === i && !positive) continue;
            const to = fractionalToCartesian(lattice, [
              b.position[0] + sa,
              b.position[1] + sb,
              b.position[2] + sc,
            ]);
            const squared =
              ((to[0] ?? 0) - (from[0] ?? 0)) ** 2 +
              ((to[1] ?? 0) - (from[1] ?? 0)) ** 2 +
              ((to[2] ?? 0) - (from[2] ?? 0)) ** 2;
            if (squared <= limit * limit && squared >= 1e-8) {
              bonds.add([i, j, sa, sb, sc].join(' '));
            }
          }
        }
      }
    }
  }
  return bonds;
}
