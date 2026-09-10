import { expect, test } from 'vitest';

import type { Vector3 } from '../orbitCamera.ts';
import type { SymmetricMatrix3 } from '../symmetricEigen.ts';
import { symmetricEigen3 } from '../symmetricEigen.ts';

function dot(a: Vector3, b: Vector3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function apply(matrix: SymmetricMatrix3, vector: Vector3): Vector3 {
  const { xx, xy, xz, yy, yz, zz } = matrix;
  const [x, y, z] = vector;
  return [
    xx * x + xy * y + xz * z,
    xy * x + yy * y + yz * z,
    xz * x + yz * y + zz * z,
  ];
}

function expectOrthonormal(vectors: readonly Vector3[]): void {
  for (let i = 0; i < 3; i++) {
    expect(dot(vectors[i] as Vector3, vectors[i] as Vector3)).toBeCloseTo(
      1,
      10,
    );

    for (let j = i + 1; j < 3; j++) {
      expect(dot(vectors[i] as Vector3, vectors[j] as Vector3)).toBeCloseTo(
        0,
        10,
      );
    }
  }
}

test('a diagonal matrix reports its own entries, largest first', () => {
  const { values, vectors } = symmetricEigen3({
    xx: 2,
    xy: 0,
    xz: 0,
    yy: 9,
    yz: 0,
    zz: 5,
  });

  expect(values).toStrictEqual([9, 5, 2]);

  expectOrthonormal(vectors);
});

test('every eigenvector is only stretched by the matrix', () => {
  const matrix: SymmetricMatrix3 = {
    xx: 4,
    xy: 1,
    xz: 0.5,
    yy: 3,
    yz: -0.75,
    zz: 2,
  };
  const { values, vectors } = symmetricEigen3(matrix);
  expectOrthonormal(vectors);
  for (let i = 0; i < 3; i++) {
    const vector = vectors[i] as Vector3;
    const stretched = apply(matrix, vector);
    const value = values[i] as number;

    expect(stretched[0]).toBeCloseTo(value * vector[0], 8);
    expect(stretched[1]).toBeCloseTo(value * vector[1], 8);
    expect(stretched[2]).toBeCloseTo(value * vector[2], 8);
  }
});

test('the eigenvalues sum to the trace and multiply to the determinant', () => {
  const matrix: SymmetricMatrix3 = {
    xx: 6,
    xy: 2,
    xz: 1,
    yy: 5,
    yz: -1,
    zz: 3,
  };
  const [a, b, c] = symmetricEigen3(matrix).values;

  expect(a + b + c).toBeCloseTo(14, 10);

  const determinant =
    6 * (5 * 3 - -1 * -1) - 2 * (2 * 3 - -1 * 1) + 1 * (2 * -1 - 5 * 1);

  expect(a * b * c).toBeCloseTo(determinant, 8);
});

test('they come back in descending order', () => {
  const { values } = symmetricEigen3({
    xx: 1,
    xy: 0.4,
    xz: 0.2,
    yy: 7,
    yz: 0.3,
    zz: 3,
  });

  expect(values[0]).toBeGreaterThanOrEqual(values[1]);
  expect(values[1]).toBeGreaterThanOrEqual(values[2]);
});

test('a repeated eigenvalue still yields three orthogonal directions', () => {
  const { values, vectors } = symmetricEigen3({
    xx: 5,
    xy: 0,
    xz: 0,
    yy: 5,
    yz: 0,
    zz: 1,
  });

  expect(values[0]).toBeCloseTo(5, 12);
  expect(values[1]).toBeCloseTo(5, 12);
  expect(values[2]).toBeCloseTo(1, 12);

  expectOrthonormal(vectors);
});

test('a matrix with nothing in it gives the standard axes', () => {
  const { values, vectors } = symmetricEigen3({
    xx: 0,
    xy: 0,
    xz: 0,
    yy: 0,
    yz: 0,
    zz: 0,
  });

  expect(values).toStrictEqual([0, 0, 0]);

  expectOrthonormal(vectors);
});

test('a flat cloud reports a zero third eigenvalue and keeps its frame', () => {
  // Every sample on the plane z = 0: the third direction has no spread at all.
  const { values, vectors } = symmetricEigen3({
    xx: 4,
    xy: 1,
    xz: 0,
    yy: 2,
    yz: 0,
    zz: 0,
  });

  expect(values[2]).toBeCloseTo(0, 12);

  expectOrthonormal(vectors);
});

test('an entry that is not finite gives no axes rather than a NaN frame', () => {
  const { values, vectors } = symmetricEigen3({
    xx: Number.NaN,
    xy: 0,
    xz: 0,
    yy: 1,
    yz: 0,
    zz: 1,
  });

  expect(values).toStrictEqual([0, 0, 0]);

  expectOrthonormal(vectors);
});
