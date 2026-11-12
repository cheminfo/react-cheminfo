import { expect, test } from 'vitest';

import { labelStackBaselines, labelStackCentre } from '../labelStack.ts';

test('the stack stands on the feature, farthest line first', () => {
  // Two lines, 13 apart, the lower one 10 above the tip.
  expect(labelStackBaselines(200, 2, [0, 300])).toStrictEqual(
    Float64Array.from([177, 190]),
  );
});

test('an absent line consumes no slot', () => {
  const two = labelStackBaselines(200, 2, [0, 300]);
  const four = labelStackBaselines(200, 4, [0, 300]);

  expect(two.at(-1)).toBe(four.at(-1));
  expect(four).toStrictEqual(Float64Array.from([151, 164, 177, 190]));
});

test('a stack that would run off the top is pushed back down', () => {
  // Wanted [-5, 8, 21]; the top line is dragged to one line height below the
  // plot edge and the rest follow it down.
  expect(labelStackBaselines(31, 3, [0, 300])).toStrictEqual(
    Float64Array.from([13, 26, 39]),
  );
});

test('a stack with room to spare is left where it stands', () => {
  expect(labelStackBaselines(100, 3, [0, 300])).toStrictEqual(
    Float64Array.from([64, 77, 90]),
  );
});

test('a mirrored stack hangs under the feature, farthest line lowest', () => {
  expect(labelStackBaselines(100, 2, [0, 300], true)).toStrictEqual(
    Float64Array.from([136, 123]),
  );
});

test('a mirrored stack that would run off the bottom is pushed back up', () => {
  expect(labelStackBaselines(280, 2, [0, 300], true)).toStrictEqual(
    Float64Array.from([300, 287]),
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

test('a stack clear of both edges stays centred on its feature', () => {
  expect(labelStackCentre(200, [50, 600], 21)).toBe(200);
});

test('a stack at an edge is slid back inside the plot, never further', () => {
  expect(labelStackCentre(55, [50, 600], 21)).toBe(71);
  expect(labelStackCentre(598, [50, 600], 21)).toBe(579);
  expect(labelStackCentre(71, [50, 600], 21)).toBe(71);
});

test('a plot narrower than one stack leaves it on its feature', () => {
  expect(labelStackCentre(55, [50, 80], 21)).toBe(55);
});
