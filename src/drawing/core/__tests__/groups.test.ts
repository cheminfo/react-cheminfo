import { expect, test } from 'vitest';

import { parseGroups, renumberGroups } from '../groupFiles.ts';
import type { DrawGroup } from '../groups.ts';
import {
  expandToGroups,
  leafMembers,
  outermostUnits,
  reconcileGroups,
  withGroup,
  withoutGroups,
} from '../groups.ts';

// a and b in g1; g1 and c in g2; d alone.
const NESTED: DrawGroup[] = [
  { id: 'g1', members: ['a', 'b'] },
  { id: 'g2', members: ['g1', 'c'] },
];

test('a member is selected with everything its outermost group holds', () => {
  expect([...outermostUnits(NESTED, ['a', 'd'])]).toStrictEqual(['g2', 'd']);
  expect(leafMembers(NESTED, ['g2'])).toStrictEqual(['a', 'b', 'c']);
  expect(expandToGroups(NESTED, ['b'])).toStrictEqual(['a', 'b', 'c']);
  expect(expandToGroups(undefined, ['b', 'd'])).toStrictEqual(['b', 'd']);
});

test('one thing is not a group; two make one, and ungrouping gives them back one level', () => {
  expect(withGroup(NESTED, ['a', 'c'], 'g3')).toBeUndefined();

  const grouped = withGroup(NESTED, ['a', 'd'], 'g3');

  expect(grouped?.at(-1)).toStrictEqual({ id: 'g3', members: ['g2', 'd'] });

  expect(withoutGroups(grouped, ['d'])).toStrictEqual(NESTED);
  expect(withoutGroups(NESTED, ['d'])).toBeUndefined();
});

test('a member gone leaves its group, and a group left with one member dissolves upwards', () => {
  expect(reconcileGroups(NESTED, new Set(['a', 'b', 'c']))).toBe(NESTED);
  // b gone: g1 keeps only a, which moves up into g2.
  expect(reconcileGroups(NESTED, new Set(['a', 'c']))).toStrictEqual([
    { id: 'g2', members: ['c', 'a'] },
  ]);
  expect(reconcileGroups(NESTED, new Set(['a']))).toStrictEqual([]);
  // A member named twice stays in the first group; a group never holds itself.
  expect(
    reconcileGroups(
      [
        { id: 'x', members: ['a', 'b', 'x'] },
        { id: 'y', members: ['a', 'c', 'd'] },
      ],
      new Set(['a', 'b', 'c', 'd']),
    ),
  ).toStrictEqual([
    { id: 'x', members: ['a', 'b'] },
    { id: 'y', members: ['c', 'd'] },
  ]);
});

test('an item the site says replaced a grouped one goes back into its group', () => {
  expect(
    reconcileGroups(
      [{ id: 'g', members: ['a', 'b'] }],
      new Set(['a', 'b', 'e']),
      new Map([['e', 'g']]),
    ),
  ).toStrictEqual([{ id: 'g', members: ['a', 'b', 'e'] }]);
});

test('groups are read from a file and renamed for a paste', () => {
  expect(
    parseGroups([
      { id: 'g', members: ['a', 2, '', 'b'] },
      { id: 'g', members: ['c'] },
      { members: ['d'] },
      'nonsense',
    ]),
  ).toStrictEqual([{ id: 'g', members: ['a', 'b'] }]);
  expect(parseGroups(undefined)).toBeUndefined();

  let next = 0;

  expect(
    renumberGroups(
      NESTED,
      new Map([
        ['a', 'a2'],
        ['c', 'c2'],
      ]),
      () => {
        next += 1;
        return `n${next}`;
      },
    ),
  ).toStrictEqual([
    { id: 'n1', members: ['a2'] },
    { id: 'n2', members: ['n1', 'c2'] },
  ]);
});
