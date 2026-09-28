import { expect, test } from 'vitest';

import {
  CHART_LAYERS,
  MARGIN,
  MINIMUM_PLOT_SIDE,
  plotRect,
} from '../chartGeometry.ts';

test('the margins are the room the axes were given', () => {
  expect(MARGIN).toStrictEqual({ top: 10, right: 16, bottom: 34, left: 60 });
  expect(MINIMUM_PLOT_SIDE).toBe(10);
});

test('the plot is what the margins leave over', () => {
  expect(plotRect({ width: 800, height: 400 })).toStrictEqual({
    left: 60,
    top: 10,
    width: 724,
    height: 356,
    right: 784,
    bottom: 366,
  });
});

test('a chart laid out at nothing still describes a plot', () => {
  expect(plotRect({ width: 0, height: 0 })).toStrictEqual({
    left: 60,
    top: 10,
    width: 10,
    height: 10,
    right: 70,
    bottom: 20,
  });
});

test('a chart narrower than its own margins is clamped, not negative', () => {
  expect(plotRect({ width: 40, height: 40 })).toStrictEqual({
    left: 60,
    top: 10,
    width: 10,
    height: 10,
    right: 70,
    bottom: 20,
  });
});

test('a chart one pixel wider than the clamp escapes it', () => {
  const rect = plotRect({ width: 87, height: 55 });

  expect(rect.width).toBe(11);
  expect(rect.height).toBe(11);
  expect(rect.right).toBe(71);
  expect(rect.bottom).toBe(21);
});

test('the six bands are painted bottom to top', () => {
  expect(CHART_LAYERS).toStrictEqual([
    'defs',
    'axes',
    'data',
    'guide',
    'selection',
    'tracker',
  ]);
});

test('a partial margin overrides only the sides it names', () => {
  expect(plotRect({ width: 800, height: 400 }, { bottom: 4 })).toStrictEqual({
    left: 60,
    top: 10,
    width: 724,
    height: 386,
    right: 784,
    bottom: 396,
  });

  expect(
    plotRect({ width: 800, height: 400 }, { left: 8, top: 0 }),
  ).toStrictEqual({
    left: 8,
    top: 0,
    width: 776,
    height: 366,
    right: 784,
    bottom: 366,
  });
});

test('an override that leaves nothing over is clamped, not negative', () => {
  expect(
    plotRect({ width: 200, height: 60 }, { left: 400, bottom: 300 }),
  ).toStrictEqual({
    left: 400,
    top: 10,
    width: 10,
    height: 10,
    right: 410,
    bottom: 20,
  });
});

test('a margin that names no side draws what the one-argument form draws', () => {
  const defaulted = {
    left: 60,
    top: 10,
    width: 724,
    height: 356,
    right: 784,
    bottom: 366,
  };

  expect(plotRect({ width: 800, height: 400 }, {})).toStrictEqual(defaulted);
  expect(plotRect({ width: 800, height: 400 })).toStrictEqual(defaulted);
});
