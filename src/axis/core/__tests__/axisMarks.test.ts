import { expect, test } from 'vitest';

import { emptiestCorner } from '../../../overlay/core/emptiestCorner.ts';
import { axisMarkPositions } from '../axisMarks.ts';

const BOX = { width: 600, height: 400 };
const LINEAR = { x: 'linear', y: 'linear' } as const;

test('a point sits where its two values put it in the box', () => {
  const { x, y } = axisMarkPositions(
    [
      { x: 0, y: 0 },
      { x: 10, y: 100 },
      { x: 5, y: 50 },
    ],
    BOX,
    LINEAR,
  );

  expect([...x]).toStrictEqual([0, 600, 300]);
  // The vertical axis grows upwards while the box is measured from its top.
  expect([...y]).toStrictEqual([400, 0, 200]);
});

test('a column of identical values is centred rather than divided by zero', () => {
  const { x } = axisMarkPositions(
    [
      { x: 7, y: 1 },
      { x: 7, y: 2 },
    ],
    BOX,
    LINEAR,
  );

  expect([...x]).toStrictEqual([300, 300]);
});

test('a logarithmic axis places its marks logarithmically', () => {
  const { y } = axisMarkPositions(
    [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1000 },
    ],
    BOX,
    { x: 'linear', y: 'log' },
  );

  // Linearly, 1 would land a tenth of a percent off the bottom; the symmetric
  // log lifts it a tenth of the way up, which is a different corner's worth.
  expect(y[1]).toBeCloseTo(400 - 40.1, 1);
});

test('the corner a card may take follows the data, not a fixed choice', () => {
  const climbing = axisMarkPositions(
    [
      { x: 0, y: 0 },
      { x: 5, y: 20 },
      { x: 10, y: 45 },
    ],
    BOX,
    LINEAR,
  );

  expect(emptiestCorner(climbing.x, climbing.y, BOX)).toBe('top-left');

  const falling = axisMarkPositions(
    [
      { x: 0, y: 45 },
      { x: 5, y: 20 },
      { x: 10, y: 0 },
    ],
    BOX,
    LINEAR,
  );

  expect(emptiestCorner(falling.x, falling.y, BOX)).toBe('top-right');
});
