import { expect, test } from 'vitest';

import { nextFold } from '../useMeasuredFold.ts';

test('a row folds once its name would have less than its least room, and unfolds only once it can hold every part and that room again', () => {
  // A 380 px row whose other parts take 262 px leaves its name 118 px.
  const narrow = nextFold(
    false,
    { row: 380, kept: 118, available: 380 },
    120,
    null,
  );
  // Folded, the row is as wide; it stays folded until it is 382 px wide.
  const stays = nextFold(
    true,
    { row: 380, kept: 300, available: 381 },
    120,
    narrow.needed,
  );
  const unfolds = nextFold(
    true,
    { row: 382, kept: 300, available: 382 },
    120,
    narrow.needed,
  );
  const wide = nextFold(
    false,
    { row: 416, kept: 154, available: 416 },
    120,
    null,
  );

  expect([narrow, stays, unfolds, wide]).toStrictEqual([
    { folded: true, needed: 382 },
    { folded: true, needed: 382 },
    { folded: false, needed: 382 },
    { folded: false, needed: 382 },
  ]);
});

test('a row folded before it was ever measured whole stays folded', () => {
  expect(
    nextFold(true, { row: 900, kept: 0, available: 900 }, 120, null),
  ).toStrictEqual({ folded: true, needed: null });
});
