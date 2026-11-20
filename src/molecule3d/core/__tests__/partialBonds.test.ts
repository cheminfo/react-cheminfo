import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import { bondLimit } from '../../../molstar/bonds/bondRule.ts';
import type { PartialBondGeometry } from '../partialBonds.ts';
import { findPartialBonds } from '../partialBonds.ts';

test('the two forming bonds of a Diels–Alder transition state', () => {
  expect(partialBondsOf(readXyz('diels-alder-ts.xyz'))).toStrictEqual([
    'C1–C6 2.270',
    'C4–C5 2.270',
  ]);
});

test('the bond formed and the bond broken in an SN2 transition state', () => {
  expect(partialBondsOf(readXyz('sn2-ts.xyz'))).toStrictEqual([
    'C1–Cl2 2.320',
    'C1–Cl3 2.320',
  ]);
});

test('benzene has none, though its 1,3 carbons are 2.41 Å apart', () => {
  expect(partialBondsOf(readXyz('benzene.xyz'))).toStrictEqual([]);
});

test('three bonds apart, a pair is held to the near reach', () => {
  // C1–C2–C3–C4, bent until C1 and C4 are 2.2 Å apart: a four-membered ring
  // closing, as in an electrocyclic ring closure.
  expect(partialBondsOf(chain(2.2))).toStrictEqual(['C1–C4 2.200']);
  // At 2.55 Å it is a ring held open, like the 2.59 Å of bicyclo[2.2.2]octane.
  expect(partialBondsOf(chain(2.55))).toStrictEqual([]);
});

test('two molecules are held to the far reach', () => {
  // Two C–C units side by side, 2.55 Å apart, then 2.65 Å.
  expect(partialBondsOf(pairOfDimers(2.55))).toStrictEqual([
    'C1–C3 2.550',
    'C2–C4 2.550',
  ]);
  expect(partialBondsOf(pairOfDimers(2.65))).toStrictEqual([]);
});

test('a hydrogen bond is not a partial bond', () => {
  // Two waters, the hydrogen of the first 1.95 Å from the oxygen of the second.
  const dimer = geometry(
    ['O', 'H', 'H', 'O', 'H', 'H'],
    [
      [0, 0, 0],
      [0.96, 0, 0],
      [-0.24, 0.93, 0],
      [2.91, 0, 0],
      [3.15, 0.93, 0],
      [3.15, -0.93, 0],
    ],
  );

  expect(partialBondsOf(dimer)).toStrictEqual([]);
});

test('a proton in flight is bonded to both oxygens, and they through it', () => {
  // O···H···O with 1.2 Å either side: the oxygens, 2.4 Å apart, would be a
  // partial bond if the line between them did not pass through the proton.
  const transfer = geometry(
    ['O', 'H', 'O'],
    [
      [0, 0, 0],
      [1.2, 0.05, 0],
      [2.4, 0, 0],
    ],
  );

  expect(partialBondsOf(transfer)).toStrictEqual([
    'O1–H2 1.201',
    'H2–O3 1.201',
  ]);
});

test('two hydrogens are never partially bonded', () => {
  const hydrogens = geometry(
    ['H', 'H'],
    [
      [0, 0, 0],
      [1.2, 0, 0],
    ],
  );

  expect(partialBondsOf(hydrogens)).toStrictEqual([]);
});

test('a bond the file writes stays a bond, however long', () => {
  // A molfile may bond the forming pair of a transition state itself.
  const written = { ...readXyz('sn2-ts.xyz') };
  written.bonds = [...written.bonds, 0, 1];

  expect(
    findPartialBonds(written, { bondLimit }).map(({ first, second }) => [
      first,
      second,
    ]),
  ).toStrictEqual([[0, 2]]);
});

test('a reach can be narrowed', () => {
  expect(
    findPartialBonds(pairOfDimers(2.55), {
      bondLimit,
      far: { stretch: 1.4, reach: 0.7 },
    }),
  ).toStrictEqual([]);
});

test('bonds naming no atom, and coordinates missing, are skipped', () => {
  const sn2 = readXyz('sn2-ts.xyz');
  const broken: PartialBondGeometry = {
    elements: [...sn2.elements, 'C'],
    coordinates: sn2.coordinates,
    bonds: [...sn2.bonds, 0, 99, -1, 2, 1.5, 0, 3, 3],
  };

  const found = findPartialBonds(broken, { bondLimit });

  expect(found.map(({ first, second }) => [first, second])).toStrictEqual([
    [0, 1],
    [0, 2],
  ]);
  expect(found[0]?.distance).toBeCloseTo(2.32, 12);
});

interface Geometry {
  elements: string[];
  coordinates: number[];
  bonds: number[];
}

function partialBondsOf(atoms: Geometry): string[] {
  const { elements } = atoms;
  return findPartialBonds(atoms, { bondLimit }).map(
    ({ first, second, distance }) =>
      `${elements[first]}${first + 1}–${elements[second]}${second + 1} ${distance.toFixed(3)}`,
  );
}

/**
 * Atoms, bonded as molstar bonds an XYZ file: by distance alone.
 * @param elements - The element of each atom.
 * @param positions - Its coordinates.
 * @returns The geometry.
 */
function geometry(
  elements: string[],
  positions: Array<[number, number, number]>,
): Geometry {
  const coordinates = positions.flat();
  const bonds: number[] = [];
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const distance = Math.hypot(
        (coordinates[i * 3] ?? 0) - (coordinates[j * 3] ?? 0),
        (coordinates[i * 3 + 1] ?? 0) - (coordinates[j * 3 + 1] ?? 0),
        (coordinates[i * 3 + 2] ?? 0) - (coordinates[j * 3 + 2] ?? 0),
      );
      if (distance <= bondLimit(elements[i] ?? '', elements[j] ?? '')) {
        bonds.push(i, j);
      }
    }
  }
  return { elements, coordinates, bonds };
}

function readXyz(name: string): Geometry {
  const text = new TextDecoder().decode(
    readFileSync(join(import.meta.dirname, 'data', name)),
  );
  const lines = text.split('\n').slice(2);
  const elements: string[] = [];
  const positions: Array<[number, number, number]> = [];
  for (const line of lines) {
    const [element, x, y, z] = line.trim().split(/\s+/);
    if (element === undefined || element === '') continue;
    elements.push(element);
    positions.push([Number(x), Number(y), Number(z)]);
  }
  return geometry(elements, positions);
}

// C1–C2–C3–C4 in a plane, 1.5 Å bonds, the ends `span` apart.
function chain(span: number): Geometry {
  const shift = (span - 1.5) / 2;
  const height = Math.sqrt(1.5 * 1.5 - shift * shift);
  return geometry(
    ['C', 'C', 'C', 'C'],
    [
      [-shift, height, 0],
      [0, 0, 0],
      [1.5, 0, 0],
      [1.5 + shift, height, 0],
    ],
  );
}

// C1–C2 and C3–C4, parallel, `gap` apart.
function pairOfDimers(gap: number): Geometry {
  return geometry(
    ['C', 'C', 'C', 'C'],
    [
      [0, 0, 0],
      [1.5, 0, 0],
      [0, gap, 0],
      [1.5, gap, 0],
    ],
  );
}
