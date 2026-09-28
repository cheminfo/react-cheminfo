import { expect, test } from 'vitest';

import { labelStackBaselines } from '../labelStack.ts';

test('the stack stands on the feature, farthest line first', () => {
  // Two lines, 11 apart, the lower one 10 above the tip.
  expect(labelStackBaselines(200, 2, [0, 300])).toStrictEqual(
    Float64Array.from([179, 190]),
  );
});

test('an absent line consumes no slot', () => {
  const two = labelStackBaselines(200, 2, [0, 300]);
  const four = labelStackBaselines(200, 4, [0, 300]);

  expect(two.at(-1)).toBe(four.at(-1));
  expect(four).toStrictEqual(Float64Array.from([157, 168, 179, 190]));
});

test('a stack that would run off the top is pushed back down', () => {
  // Wanted [-1, 10, 21]; the top line is dragged to one line height below the
  // plot edge and the rest follow it down.
  expect(labelStackBaselines(31, 3, [0, 300])).toStrictEqual(
    Float64Array.from([11, 22, 33]),
  );
});

test('a stack with room to spare is left where it stands', () => {
  expect(labelStackBaselines(100, 3, [0, 300])).toStrictEqual(
    Float64Array.from([68, 79, 90]),
  );
});

test('a mirrored stack hangs under the feature, farthest line lowest', () => {
  expect(labelStackBaselines(100, 2, [0, 300], true)).toStrictEqual(
    Float64Array.from([132, 121]),
  );
});

test('a mirrored stack that would run off the bottom is pushed back up', () => {
  expect(labelStackBaselines(280, 2, [0, 300], true)).toStrictEqual(
    Float64Array.from([300, 289]),
  );
});

test('no lines is not an error', () => {
  expect(labelStackBaselines(100, 0, [0, 300])).toStrictEqual(
    new Float64Array(0),
  );
  expect(labelStackBaselines(100, Number.NaN, [0, 300])).toStrictEqual(
    new Float64Array(0),
  );
});
