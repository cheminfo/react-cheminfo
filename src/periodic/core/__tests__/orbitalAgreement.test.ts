import { expect, test } from 'vitest';

import {
  HIGHEST_ATOMIC_NUMBER,
  NOBLE_GASES,
} from '../../../orbital/core/electronConfiguration.ts';
import { PERIODIC_ELEMENTS } from '../elements.ts';

test('the orbital module ends the table where the table ends', () => {
  expect(PERIODIC_ELEMENTS).toHaveLength(HIGHEST_ATOMIC_NUMBER);
});

test('the noble gases a configuration abbreviates on are the noble-gas family', () => {
  const nobleGases: number[] = [];
  for (const element of PERIODIC_ELEMENTS) {
    if (element.category === 'noble-gas') nobleGases.push(element.atomicNumber);
  }

  expect(nobleGases).toStrictEqual([...NOBLE_GASES]);
});
