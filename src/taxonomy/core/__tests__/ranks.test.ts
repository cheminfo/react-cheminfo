import { expect, test } from 'vitest';

import {
  PRINCIPAL_RANKS,
  TAXON_RANKS,
  isAboveGenus,
  isGenusOrBelow,
  isPrincipalRank,
  rankOrder,
} from '../ranks.ts';

test('the ranks run from the top of the tree down', () => {
  expect(TAXON_RANKS).toHaveLength(46);
  expect(rankOrder('realm')).toBe(0);
  expect(rankOrder('genus')).toBe(24);
  expect(rankOrder('isolate')).toBe(45);
  expect(rankOrder('no rank')).toBeUndefined();
  expect(rankOrder('clade')).toBeUndefined();

  const principal = PRINCIPAL_RANKS.map((rank) => rankOrder(rank) ?? -1);

  expect(principal).toStrictEqual(principal.toSorted((a, b) => a - b));
});

test('a lineage is summarised by ten ranks, counting the three tops', () => {
  expect(PRINCIPAL_RANKS.filter((rank) => isPrincipalRank(rank))).toHaveLength(
    10,
  );
  expect(isPrincipalRank('domain')).toBe(true);
  expect(isPrincipalRank('subfamily')).toBe(false);
  expect(isPrincipalRank('clade')).toBe(false);
});

test('the genus is where the italics start', () => {
  expect(isGenusOrBelow('genus')).toBe(true);
  expect(isGenusOrBelow('varietas')).toBe(true);
  expect(isGenusOrBelow('strain')).toBe(true);
  expect(isGenusOrBelow('subtribe')).toBe(false);
  expect(isGenusOrBelow('no rank')).toBe(false);

  expect(isAboveGenus('family')).toBe(true);
  expect(isAboveGenus('genus')).toBe(false);
  expect(isAboveGenus('clade')).toBe(false);
});
