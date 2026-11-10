import { expect, test } from 'vitest';

import { seriesRowText } from '../seriesRowText.ts';

const COLUMNS = ['R1', 'R2', 'R3', 'R4'];

test('positions taking one value are named together, in the order of the columns', () => {
  expect(
    seriesRowText(
      { id: 'a', values: { R1: 'I', R2: 'H', R3: 'H', R4: 'H' } },
      COLUMNS,
    ),
  ).toBe('R1 = I, R2 = R3 = R4 = H');
  expect(
    seriesRowText(
      { id: 'b', values: { R1: 'H', R2: 'H', R3: 'Br', R4: 'H' } },
      COLUMNS,
    ),
  ).toBe('R1 = R2 = R4 = H, R3 = Br');
});

test('a position without a value, or outside the columns, is left out', () => {
  expect(
    seriesRowText({ id: 'c', values: { R2: 'Me', R9: 'Et', R3: '' } }, COLUMNS),
  ).toBe('R2 = Me');
  expect(seriesRowText({ id: 'd', values: {} }, COLUMNS)).toBe('');
});
