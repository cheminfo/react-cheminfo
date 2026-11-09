import { expect, test } from 'vitest';

import { idsOf, patchOf, sharedValue } from '../shared.ts';

const objects = [
  { id: 'a', size: 10, align: 'left' },
  { id: 'b', size: 12, align: 'left' },
];

test('a value every object has is shared, one they differ on is not', () => {
  expect(sharedValue(objects, (object) => object.align)).toBe('left');
  expect(sharedValue(objects, (object) => object.size)).toBeUndefined();
  expect(
    sharedValue([], (object: { size: number }) => object.size),
  ).toBeUndefined();
});

test('a change is the same for each object, or worked out from each', () => {
  expect(patchOf({ size: 14 }, objects[0])).toStrictEqual({ size: 14 });
  expect(
    patchOf((object: { size: number }) => ({ size: object.size * 2 }), {
      size: 12,
    }),
  ).toStrictEqual({ size: 24 });
  expect(idsOf(objects)).toStrictEqual(['a', 'b']);
});
