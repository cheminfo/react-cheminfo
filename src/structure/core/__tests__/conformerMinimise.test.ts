import { expect, test } from 'vitest';

import type { RankedConformer } from '../conformerMinimise.ts';
import { rankByEnergy } from '../conformerMinimise.ts';

test('the lowest energy comes first, and a missing energy after every known one', () => {
  const ranked = rankByEnergy([
    conformer('a', null),
    conformer('b', 3.5),
    conformer('c', -1.25),
    conformer('d', 3.5),
    conformer('e', null),
  ]);

  expect(ranked).toStrictEqual([
    { name: 'c', id: 1, energy: -1.25, relativeEnergy: 0 },
    { name: 'b', id: 2, energy: 3.5, relativeEnergy: 4.75 },
    { name: 'd', id: 3, energy: 3.5, relativeEnergy: 4.75 },
    { name: 'a', id: 4, energy: null, relativeEnergy: null },
    { name: 'e', id: 5, energy: null, relativeEnergy: null },
  ]);
});

test('a set without any energy keeps its order', () => {
  const ranked = rankByEnergy([conformer('a', null), conformer('b', null)]);

  expect(ranked).toStrictEqual([
    { name: 'a', id: 1, energy: null, relativeEnergy: null },
    { name: 'b', id: 2, energy: null, relativeEnergy: null },
  ]);
});

test('an empty set stays empty', () => {
  expect(rankByEnergy([])).toStrictEqual([]);
});

function conformer(
  name: string,
  energy: number | null,
): RankedConformer & { name: string } {
  return { name, id: 0, energy, relativeEnergy: null };
}
