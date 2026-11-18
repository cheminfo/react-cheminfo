import { expect, test } from 'vitest';

import { SPACE_GROUP_SETTINGS } from '../../spaceGroups/spaceGroups.ts';
import {
  identityMatrix,
  matricesEqual,
  matrixAdjugate,
  matrixDeterminant,
  multiplyMatrices,
  multiplyMatrixVector,
} from '../integerMatrix.ts';
import { parseOperation } from '../parseOperation.ts';

test('the determinant of the rotations a crystal actually has', () => {
  // A 3-fold along [111], which is where a sign slip in the cyclic expansion hides.
  const threeFold = [
    [0, 0, 1],
    [1, 0, 0],
    [0, 1, 0],
  ];

  expect(matrixDeterminant(threeFold)).toBe(1);
  expect(matrixDeterminant(parseOperation('-x,-y,-z', 3).rotation)).toBe(-1);
  expect(matrixDeterminant(parseOperation('y,x,z', 3).rotation)).toBe(-1);
  expect(matrixDeterminant(parseOperation('-y,x-y,z', 3).rotation)).toBe(1);
  expect(matrixDeterminant(parseOperation('-y,x', 2).rotation)).toBe(1);
});

test('every one of the 7244 rotation parts is unimodular', () => {
  let checked = 0;
  for (const setting of SPACE_GROUP_SETTINGS) {
    for (const xyz of setting.operations) {
      expect(Math.abs(matrixDeterminant(parseOperation(xyz, 3).rotation))).toBe(
        1,
      );

      checked += 1;
    }
  }

  expect(checked).toBe(7244);
});

test('adjugate times matrix is the determinant times the identity, exactly', () => {
  for (const xyz of ['-y,x-y,z', 'y,x,-z', '-z,-x,y', '-x,-y,-z']) {
    const rotation = parseOperation(xyz, 3).rotation;
    const determinant = matrixDeterminant(rotation);
    const product = multiplyMatrices(matrixAdjugate(rotation), rotation);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(product[i]?.[j]).toBe(i === j ? determinant : 0);
      }
    }
  }
  const quarterTurn = parseOperation('-y,x', 2).rotation;

  expect(
    matricesEqual(
      multiplyMatrices(matrixAdjugate(quarterTurn), quarterTurn),
      identityMatrix(2),
    ),
  ).toBe(true);
});

test('a matrix times a vector, and matrices of different sizes differ', () => {
  expect(
    multiplyMatrixVector(parseOperation('-y,x-y,z', 3).rotation, [1, 2, 3]),
  ).toStrictEqual([-2, -1, 3]);
  expect(matricesEqual(identityMatrix(2), identityMatrix(3))).toBe(false);
  expect(() => matrixDeterminant([[1]])).toThrow(
    /expected a 2×2 or 3×3 matrix/,
  );
});
