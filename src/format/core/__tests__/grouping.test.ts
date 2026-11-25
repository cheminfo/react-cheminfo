import { expect, test } from 'vitest';

import { formatDecimal, formatGrouped, formatInteger } from '../numbers.ts';
import { withUnit } from '../unitSpace.ts';

test('the thousands are grouped by the locale’s comma, or by a no-break space, part by part', () => {
  const french = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

  expect([
    formatInteger(33_076),
    formatInteger(33_076, { grouping: 'space' }),
    formatDecimal(32_767.5, 1, { grouping: 'space' }),
    formatGrouped(french, 1234.5, 'space'),
    formatInteger(Number.NaN, { grouping: 'space' }),
  ]).toStrictEqual(['33,076', '33 076', '32 767.5', '1 234,5', '–']);
});

test('a number and its unit are one word, and a number without a unit stays as it is', () => {
  expect([withUnit('1.075', 'nm'), withUnit('7', '')]).toStrictEqual([
    '1.075 nm',
    '7',
  ]);
});
