import { expect, test } from 'vitest';

import { closure } from '../../symmetry/group.ts';
import { operationKey } from '../../symmetry/operation.ts';
import { spaceGroupOperations } from '../spaceGroupOperations.ts';
import {
  SPACE_GROUP_SETTINGS,
  SPACE_GROUP_SETTINGS_BY_NUMBER,
  spaceGroup,
} from '../spaceGroups.ts';

test('the table holds 521 settings of 230 numbers and 7244 operations', () => {
  expect(SPACE_GROUP_SETTINGS).toHaveLength(521);
  expect(SPACE_GROUP_SETTINGS_BY_NUMBER.size).toBe(230);

  let operations = 0;
  for (const setting of SPACE_GROUP_SETTINGS) {
    operations += setting.multiplicity;
  }

  expect(operations).toBe(7244);
});

test('every setting is a group: its operations close on themselves', () => {
  const open: string[] = [];
  for (const setting of SPACE_GROUP_SETTINGS) {
    const operations = spaceGroupOperations(setting);
    const closed = closure(operations);
    const keys = new Set<string>();
    for (const operation of operations) keys.add(operationKey(operation));
    if (closed.length !== keys.size || keys.size !== setting.multiplicity) {
      open.push(`${setting.number}/${setting.variant}`);
    }
  }

  expect(open).toStrictEqual([]);
});

test('a setting is reached by its number and variant, and nothing else is', () => {
  expect(spaceGroup(14).hmSetting).toBe('P 1 21/c 1');
  expect(spaceGroup(227, 1).originChoice).toBe(1);
  expect(spaceGroup(225).multiplicity).toBe(192);
  expect(() => spaceGroup(231)).toThrow('231 is not a space group number');
  expect(() => spaceGroup(1, 1)).toThrow(
    'space group 1 has 1 settings, so there is no 1',
  );
});

test('the operations of a setting are parsed once and kept', () => {
  const setting = spaceGroup(14);

  expect(spaceGroupOperations(setting)).toBe(spaceGroupOperations(setting));
  expect(spaceGroupOperations(setting)[1]).toStrictEqual({
    dimension: 3,
    rotation: [
      [-1, 0, 0],
      [0, 1, 0],
      [0, 0, -1],
    ],
    translation: [0, 6, 6],
  });
});
