import { expect, test } from 'vitest';

import { wholeWordmarkHidden } from '../useWholeWordmark.ts';

test('a name the bar would cut gives way to the mark, and comes back only with room for it whole', () => {
  const name = { natural: 129, gap: 9 };

  expect([
    wholeWordmarkHidden(false, { ...name, shown: 129, left: 0 }),
    wholeWordmarkHidden(false, { ...name, shown: 113, left: 0 }),
    wholeWordmarkHidden(true, { ...name, shown: 0, left: 130 }),
    wholeWordmarkHidden(true, { ...name, shown: 0, left: 138 }),
    wholeWordmarkHidden(true, { natural: 0, gap: 9, shown: 0, left: 500 }),
  ]).toStrictEqual([false, true, true, false, true]);
});
