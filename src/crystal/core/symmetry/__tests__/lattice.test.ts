import { expect, test } from 'vitest';

import {
  cartesianMatrix,
  cartesianToFractional,
  cellVolume,
  createLattice,
  fractionalToCartesian,
} from '../lattice.ts';

const CUBIC = { a: 4, b: 4, c: 4, alpha: 90, beta: 90, gamma: 90 };
const HEXAGONAL = { a: 3, b: 3, c: 5, alpha: 90, beta: 90, gamma: 120 };
const MONOCLINIC = { a: 5, b: 6, c: 7, alpha: 90, beta: 100, gamma: 90 };
const TRICLINIC = { a: 5.1, b: 6.2, c: 7.3, alpha: 80, beta: 85, gamma: 95 };

test('the volume of a cell whose answer is obvious', () => {
  expect(cellVolume(CUBIC)).toBeCloseTo(64, 12);
  // a·b·c·sin γ for a monoclinic cell, and a²·c·sin 120° for a hexagonal one.
  expect(cellVolume(MONOCLINIC)).toBeCloseTo(206.8096281325637, 10);
  expect(cellVolume(HEXAGONAL)).toBeCloseTo(38.97114317029975, 10);
});

test('no cell has these angles', () => {
  expect(() =>
    cellVolume({ a: 5, b: 5, c: 5, alpha: 20, beta: 20, gamma: 150 }),
  ).toThrow(/no cell has the angles/);
});

test('a lies along x and b lies in the xy plane', () => {
  const matrix = cartesianMatrix(HEXAGONAL);

  expect(matrix[0]?.[0]).toBe(3);
  expect(matrix[1]?.[0]).toBe(0);
  expect(matrix[2]?.[0]).toBe(0);
  expect(matrix[2]?.[1]).toBe(0);

  const lattice = createLattice(HEXAGONAL);
  const b = fractionalToCartesian(lattice, [0, 1, 0]);

  expect(b[0] ?? 0).toBeCloseTo(-1.5, 12);
  expect(b[1] ?? 0).toBeCloseTo(2.598076211353316, 12);
  expect(b[2] ?? 0).toBeCloseTo(0, 12);
});

test('the lengths and angles of a triclinic cell are those of its matrix', () => {
  const { cartesian, volume } = createLattice(TRICLINIC);
  const column = (index: number) => [
    cartesian[0]?.[index] ?? 0,
    cartesian[1]?.[index] ?? 0,
    cartesian[2]?.[index] ?? 0,
  ];
  const [a, b, c] = [column(0), column(1), column(2)];

  expect(Math.sqrt(dot(a, a))).toBeCloseTo(5.1, 12);
  expect(Math.sqrt(dot(b, b))).toBeCloseTo(6.2, 12);
  expect(Math.sqrt(dot(c, c))).toBeCloseTo(7.3, 12);

  const degrees = (u: number[], v: number[]) =>
    (Math.acos(dot(u, v) / Math.sqrt(dot(u, u) * dot(v, v))) * 180) / Math.PI;

  expect(degrees(b, c)).toBeCloseTo(80, 10);
  expect(degrees(c, a)).toBeCloseTo(85, 10);
  expect(degrees(a, b)).toBeCloseTo(95, 10);
  expect(volume).toBeCloseTo(225.2199406520876, 9);
});

test('fractional and Cartesian are inverse, even in a triclinic cell', () => {
  const lattice = createLattice(TRICLINIC);
  const back = cartesianToFractional(
    lattice,
    fractionalToCartesian(lattice, [0.13, 0.57, 0.91]),
  );

  expect(back[0] ?? 0).toBeCloseTo(0.13, 12);
  expect(back[1] ?? 0).toBeCloseTo(0.57, 12);
  expect(back[2] ?? 0).toBeCloseTo(0.91, 12);
});

/**
 * The dot product of two Cartesian vectors.
 * @param u - One vector.
 * @param v - The other.
 * @returns u · v.
 */
function dot(u: readonly number[], v: readonly number[]): number {
  return (
    (u[0] ?? 0) * (v[0] ?? 0) +
    (u[1] ?? 0) * (v[1] ?? 0) +
    (u[2] ?? 0) * (v[2] ?? 0)
  );
}
