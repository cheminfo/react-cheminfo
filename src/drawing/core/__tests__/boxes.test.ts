import { expect, test } from 'vitest';

import { grownBox, pointsAttribute, roundPoint } from '../boxes.ts';

test('a box grows by the same distance on every side', () => {
  expect(grownBox({ x: 10, y: 20, width: 30, height: 40 }, 5)).toStrictEqual({
    x: 5,
    y: 15,
    width: 40,
    height: 50,
  });
  expect(grownBox({ x: 10, y: 20, width: 30, height: 40 }, -5)).toStrictEqual({
    x: 15,
    y: 25,
    width: 20,
    height: 30,
  });
});

test('a point is rounded to a hundredth, never to −0', () => {
  const rounded = roundPoint({ x: 1.23456, y: -0.001 });

  expect(rounded).toStrictEqual({ x: 1.23, y: 0 });
  expect(Object.is(rounded.y, -0)).toBe(false);
});

test('the points of a polygon are written as x,y pairs', () => {
  expect(
    pointsAttribute([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 5, y: 5.5 },
    ]),
  ).toBe('0,0 10,0 5,5.5');
  expect(pointsAttribute([])).toBe('');
});
