import { expect, test } from 'vitest';

import { rowSpacers } from '../rowSpacers.ts';

test('the spacers carry the rows that were not drawn, above and below', () => {
  const drawn = [
    { start: 360, end: 378 },
    { start: 378, end: 396 },
    { start: 396, end: 414 },
  ];

  expect(rowSpacers(drawn, 9000)).toStrictEqual({ before: 360, after: 8586 });
});

test('the list is one spacer tall before a single row has been drawn', () => {
  expect(rowSpacers([], 9000)).toStrictEqual({ before: 0, after: 9000 });
});

test('a table showing its first rows leaves nothing above them', () => {
  const drawn = [
    { start: 0, end: 18 },
    { start: 18, end: 36 },
  ];

  expect(rowSpacers(drawn, 36)).toStrictEqual({ before: 0, after: 0 });
});

test('rows measured taller than the list was reckoned to be leave no gap under it', () => {
  const drawn = [{ start: 0, end: 40 }];

  expect(rowSpacers(drawn, 36)).toStrictEqual({ before: 0, after: 0 });
});

test('an empty table asks for no room at all', () => {
  expect(rowSpacers([], 0)).toStrictEqual({ before: 0, after: 0 });
});
