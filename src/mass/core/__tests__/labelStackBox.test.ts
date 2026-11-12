import { expect, test } from 'vitest';

import { labelStackBox } from '../labelStackBox.ts';

test('the box round a stack starts a line above its topmost baseline', () => {
  // Three lines, thirteen pixels apart, the topmost written at 40.
  expect(labelStackBox(200, [40, 53, 66])).toStrictEqual({
    x: 174,
    y: 27,
    width: 52,
    height: 42,
  });
});

test('a stack with no lines claims no room at all', () => {
  expect(labelStackBox(200, [])).toStrictEqual({
    x: 200,
    y: 0,
    width: 0,
    height: 0,
  });
});
