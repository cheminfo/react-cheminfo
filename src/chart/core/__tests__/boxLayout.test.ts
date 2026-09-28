import { expect, test } from 'vitest';

import { layoutAnnotationBoxes } from '../boxLayout.ts';

test('boxes that already clear one another are left where they are', () => {
  expect(layoutAnnotationBoxes([100, 200, 300], [0, 500], 40, 4)).toStrictEqual(
    Float64Array.from([100, 200, 300]),
  );
});

test('a box too close to its neighbour is pushed past it', () => {
  expect(layoutAnnotationBoxes([100, 105], [0, 500], 40, 4)).toStrictEqual(
    Float64Array.from([100, 144]),
  );
});

test('the pile the first sweep makes is pulled back inside the right edge', () => {
  expect(layoutAnnotationBoxes([480, 490], [0, 500], 40, 4)).toStrictEqual(
    Float64Array.from([436, 480]),
  );
});

test('a cluster too wide for the plot overlaps rather than leaves it', () => {
  // The left two end 16 apart where 44 was wanted, and every one is inside the
  // plot: 20 is the leftmost centre a 40-wide box may take, and 80 the rightmost.
  expect(layoutAnnotationBoxes([30, 35, 40], [0, 100], 40, 4)).toStrictEqual(
    Float64Array.from([20, 36, 80]),
  );
});

test('a crowd pulled off the right edge spaces the box below it out too', () => {
  expect(layoutAnnotationBoxes([400, 480, 490], [0, 500], 40, 4)).toStrictEqual(
    Float64Array.from([392, 436, 480]),
  );
});

test('a single box is clamped into the plot', () => {
  expect(layoutAnnotationBoxes([5], [0, 100], 40, 4)).toStrictEqual(
    Float64Array.from([20]),
  );
  expect(layoutAnnotationBoxes([95], [0, 100], 40, 4)).toStrictEqual(
    Float64Array.from([80]),
  );
});

test('the result comes back in the order the boxes were given', () => {
  expect(layoutAnnotationBoxes([105, 100], [0, 500], 40, 4)).toStrictEqual(
    Float64Array.from([144, 100]),
  );
});

test('a typed array of centres is accepted as it stands', () => {
  const centres = Float64Array.from([100, 105]);

  expect(layoutAnnotationBoxes(centres, [0, 500], 40, 4)).toStrictEqual(
    Float64Array.from([100, 144]),
  );
  expect(centres).toStrictEqual(Float64Array.from([100, 105]));
});

test('nothing to lay out is not an error', () => {
  expect(layoutAnnotationBoxes([], [0, 500], 40, 4)).toStrictEqual(
    new Float64Array(0),
  );
});

test('a plot narrower than one box collapses every box onto one centre', () => {
  expect(layoutAnnotationBoxes([10, 20], [0, 30], 40, 4)).toStrictEqual(
    Float64Array.from([20, 20]),
  );
});
