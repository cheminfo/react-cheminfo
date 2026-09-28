import { expect, test } from 'vitest';

import { plotRect } from '../chartGeometry.ts';
import { chartScale } from '../chartScale.ts';
import { guidePlacement } from '../guidePlacement.ts';

const plot = plotRect({ width: 660, height: 264 });
const xScale = chartScale(200, 400, plot.left, plot.right);

test('a value inside the window is pointed at where it sits', () => {
  expect(guidePlacement(300, plot, xScale)).toStrictEqual({
    x: 352,
    direction: null,
  });
});

test('a value off either end parks the guide on that edge', () => {
  expect(guidePlacement(150, plot, xScale)).toStrictEqual({
    x: plot.left,
    direction: 'left',
  });
  expect(guidePlacement(1200, plot, xScale)).toStrictEqual({
    x: plot.right,
    direction: 'right',
  });
});

test('a value on either bound stands on it rather than being parked', () => {
  expect(guidePlacement(200, plot, xScale)).toStrictEqual({
    x: plot.left,
    direction: null,
  });
  expect(guidePlacement(400, plot, xScale)).toStrictEqual({
    x: plot.right,
    direction: null,
  });
});

test('a value no scale maps anywhere is not pointed at', () => {
  expect(guidePlacement(Number.NaN, plot, xScale)).toBeNull();
  expect(
    guidePlacement(300, plot, chartScale(200, 400, Number.NaN, 0)),
  ).toBeNull();
});

test('an axis running backwards parks on the edge of the screen, not the end of the window', () => {
  const wavenumbers = chartScale(4000, 400, plot.left, plot.right);

  expect(guidePlacement(2200, plot, wavenumbers)).toStrictEqual({
    x: 352,
    direction: null,
  });
  expect(guidePlacement(5000, plot, wavenumbers)).toStrictEqual({
    x: plot.left,
    direction: 'left',
  });
  expect(guidePlacement(100, plot, wavenumbers)).toStrictEqual({
    x: plot.right,
    direction: 'right',
  });
});
