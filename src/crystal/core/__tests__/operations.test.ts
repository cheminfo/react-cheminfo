import { expect, test } from 'vitest';

import { miniCif } from '../cif/__tests__/fixture.ts';
import { readCif } from '../cif/read.ts';
import { structureOperations } from '../operations.ts';
import { operationKey } from '../symmetry/operation.ts';
import { parseOperation } from '../symmetry/parseOperation.ts';

import { crystalFile } from './crystalFile.ts';

const key = (xyz: string) => operationKey(parseOperation(xyz, 3));

function keysOf(text: string): string[] {
  const keys: string[] = [];
  for (const operation of structureOperations(readCif(text))) {
    keys.push(operationKey(operation));
  }
  return keys;
}

test('the file’s own operations come first, in file order', () => {
  const operations = structureOperations(crystalFile('7050902.cif'));

  expect(operations).toHaveLength(4);
  expect(operationKey(operations[0] ?? parseOperation('x,y,z', 3))).toBe(
    key('x,y,z'),
  );
});

test('one coset of a centred group is completed by the symbol', () => {
  const keys = keysOf(
    miniCif(
      [
        "_symmetry_space_group_name_H-M 'C 1 2/c 1'",
        'loop_',
        '_symmetry_equiv_pos_as_xyz',
        'x,y,z',
        '-x,y,-z+1/2',
        '-x,-y,-z',
        'x,-y,z+1/2',
      ].join('\n'),
    ),
  );

  expect(keys).toHaveLength(8);
  expect(keys.slice(0, 4)).toStrictEqual([
    key('x,y,z'),
    key('-x,y,-z+1/2'),
    key('-x,-y,-z'),
    key('x,-y,z+1/2'),
  ]);
  expect(keys).toContain(key('x+1/2,y+1/2,z'));
});

test('generators with no symbol are closed into their group', () => {
  const keys = keysOf(
    miniCif(
      ['loop_', '_symmetry_equiv_pos_as_xyz', '-x,y+1/2,-z', '-x,-y,-z'].join(
        '\n',
      ),
    ),
  );

  expect(keys.toSorted()).toStrictEqual(
    [
      key('x,y,z'),
      key('-x,y+1/2,-z'),
      key('-x,-y,-z'),
      key('x,-y+1/2,z'),
    ].toSorted(),
  );
});

test('a file listing none is expanded with the group its symbol names', () => {
  expect(
    keysOf(miniCif("_symmetry_space_group_name_H-M 'P 21/c'")),
  ).toHaveLength(4);
  expect(keysOf(miniCif('_space_group_IT_number 225'))).toHaveLength(192);
});

test('a file naming no group and listing no operation is refused', () => {
  expect(() => keysOf(miniCif(''))).toThrow(
    'This CIF names no space group this reader knows, and lists no symmetry operation.',
  );
  expect(() =>
    keysOf(miniCif(['loop_', '_symmetry_equiv_pos_as_xyz', 'x,y'].join('\n'))),
  ).toThrow(
    'This CIF names no space group this reader knows, and its operation list cannot be read: expected 3 components in "x,y", received 2.',
  );
});
