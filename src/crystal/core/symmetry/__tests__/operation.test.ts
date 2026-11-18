import { expect, test } from 'vitest';

import { spaceGroupOperations } from '../../spaceGroups/spaceGroupOperations.ts';
import { spaceGroup } from '../../spaceGroups/spaceGroups.ts';
import { closure } from '../group.ts';
import {
  apply,
  compose,
  identityOperation,
  inverse,
  isIdentity,
  operationKey,
  orbit,
  wrapFractional,
} from '../operation.ts';
import { parseOperation } from '../parseOperation.ts';
import type { CrystalOperation, Dimension } from '../types.ts';

const key = (xyz: string) => operationKey(parseOperation(xyz, 3));

function keysOf(
  operations: ReadonlyArray<CrystalOperation<Dimension>>,
): string[] {
  const keys: string[] = [];
  for (const operation of operations) keys.push(operationKey(operation));
  return keys.toSorted();
}

/** The eight general positions of the plane group p4g, in the ITA order. */
const P4G = [
  'x,y',
  '-x,-y',
  '-y,x',
  'y,-x',
  '-x+1/2,y+1/2',
  'x+1/2,-y+1/2',
  'y+1/2,x+1/2',
  '-y+1/2,-x+1/2',
];

test('compose applies the right operand first', () => {
  const screw = parseOperation('-x,y+1/2,-z+1/2', 3);
  const glide = parseOperation('x,-y+1/2,z+1/2', 3);

  expect(operationKey(compose(screw, screw))).toBe(key('x,y,z'));
  expect(operationKey(compose(screw, glide))).toBe(key('-x,-y,-z'));
  expect(operationKey(compose(glide, screw))).toBe(key('-x,-y,-z'));

  const threeFold = parseOperation('-y,x-y,z+1/3', 3);

  expect(operationKey(compose(threeFold, threeFold))).toBe(
    key('-x+y,-x,z+2/3'),
  );
});

test('inverse undoes the operation, including its translation', () => {
  for (const xyz of [
    '-y,x-y,z+1/3',
    '-x+1/2,-y,z+1/2',
    '-y+3/4,x+1/4,z+1/4',
    'y,x,-z',
  ]) {
    const operation = parseOperation(xyz, 3);

    expect(isIdentity(compose(operation, inverse(operation)))).toBe(true);
  }

  expect(operationKey(inverse(parseOperation('-y,x-y,z+1/3', 3)))).toBe(
    key('-x+y,-x,z+2/3'),
  );
});

test('apply is the image of a point, and wrapFractional brings it into the cell', () => {
  const glide = parseOperation('x+1/2,-y,z', 3);

  expect(apply(glide, [0.1, 0.2, 0.3])).toStrictEqual([0.6, -0.2, 0.3]);
  expect(wrapFractional([0.6, -0.2, 1.3])).toStrictEqual([
    0.6, 0.8, 0.30000000000000004,
  ]);
});

test('the key is exact and ignores a whole cell of translation', () => {
  expect(key('x,y,z')).toBe('1,0,0,0,1,0,0,0,1,|0,0,0,');
  expect(key('-x+1/2,y,z')).toBe(key('-x+3/2,y,z'));
  expect(operationKey(identityOperation(2))).toBe('1,0,0,1,|0,0,');
});

test('two generators close to the four operations of P2_1/c', () => {
  const generators = [
    parseOperation('-x,y+1/2,-z+1/2', 3),
    parseOperation('-x,-y,-z', 3),
  ];

  expect(keysOf(closure(generators))).toStrictEqual(
    keysOf(spaceGroupOperations(spaceGroup(14))),
  );
});

test('two generators close to the eight operations of the plane group p4g', () => {
  const generators = [
    parseOperation('-y,x', 2),
    parseOperation('-x+1/2,y+1/2', 2),
  ];
  const expanded = closure(generators);

  expect(expanded).toHaveLength(8);

  const expected: string[] = [];
  for (const xyz of P4G) expected.push(operationKey(parseOperation(xyz, 2)));

  expect(keysOf(expanded)).toStrictEqual(expected.toSorted());
});

test('closure refuses generators that are not those of a crystallographic group', () => {
  const shear = {
    dimension: 2 as const,
    rotation: [[1, 1] as const, [0, 1] as const],
    translation: [0, 0],
  };

  expect(() => closure([shear], 64)).toThrow(/do not close within 64/);
});

test('an orbit says how many atoms a site becomes, and which operation made each', () => {
  const faceCentred = spaceGroupOperations(spaceGroup(225));

  expect(orbit([0, 0, 0], faceCentred)).toHaveLength(4);
  expect(orbit([0.5, 0.5, 0.5], faceCentred)).toHaveLength(4);
  expect(orbit([0.25, 0.25, 0.25], faceCentred)).toHaveLength(8);
  expect(orbit([0.123, 0.234, 0.345], faceCentred)).toHaveLength(192);

  const sodium = orbit([0, 0, 0], faceCentred);

  expect(sodium.map((image) => image.position)).toStrictEqual([
    [0, 0, 0],
    [0, 0.5, 0.5],
    [0.5, 0, 0.5],
    [0.5, 0.5, 0],
  ]);
  expect(sodium.map((image) => image.operationIndex)).toStrictEqual([
    0, 48, 96, 144,
  ]);
});
