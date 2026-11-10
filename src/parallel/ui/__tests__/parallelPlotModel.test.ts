/**
 * The small answers a parallel-coordinates figure works out before it
 * renders: what colours the lines, which rows are drawn over the mass, how
 * many rows there are and what a screen reader is told.
 */

import { expect, test } from 'vitest';

import type { ParallelAxis } from '../../core/parallelTypes.ts';
import {
  parallelColorOf,
  parallelFigureLabel,
  parallelHighlightsOf,
  parallelIsBrushed,
  parallelRowCount,
} from '../parallelPlotModel.ts';

const MW = Float64Array.from([180, 46, 342]);
const LOGP = Float64Array.from([-3, -0.3, 1.1, 2]);

const AXES: ParallelAxis[] = [
  { id: 'mw', label: 'MW', values: MW, domain: [500, 0], scale: 'log' },
  { id: 'logP', label: 'logP', values: LOGP },
];

test('a colour the caller gives outright wins over a named axis', () => {
  const color = { values: [1, 2, 3], min: 0, max: 5 };

  expect(parallelColorOf(color, 'mw', AXES)).toBe(color);
});

test('with no colour and no axis named, the lines all take one ink', () => {
  expect(parallelColorOf(undefined, undefined, AXES)).toBeUndefined();
});

test('a named axis lends its values, its domain low end first, and its scale', () => {
  expect(parallelColorOf(undefined, 'mw', AXES)).toStrictEqual({
    values: MW,
    min: 0,
    max: 500,
    logarithmic: true,
  });
});

test('a named axis with no domain of its own lends its values alone', () => {
  expect(parallelColorOf(undefined, 'logP', AXES)).toStrictEqual({
    values: LOGP,
  });
});

test('an axis that is not on the figure colours nothing', () => {
  expect(parallelColorOf(undefined, 'tpsa', AXES)).toBeUndefined();
});

test('the hovered row is drawn last, once, over the selected ones', () => {
  expect(
    parallelHighlightsOf([2, -1, 0, 3], 0, 'teal', 'orange'),
  ).toStrictEqual([
    { row: 2, color: 'teal' },
    { row: 3, color: 'teal' },
    { row: 0, color: 'orange' },
  ]);
});

test('with nothing selected or hovered, nothing is drawn over the mass', () => {
  expect(parallelHighlightsOf(undefined, -1, 'teal', 'orange')).toStrictEqual(
    [],
  );
  expect(parallelHighlightsOf(undefined, 1, 'teal', 'orange')).toStrictEqual([
    { row: 1, color: 'orange' },
  ]);
});

test('the rows drawn are the shortest column, unless the caller insists', () => {
  expect(parallelRowCount(AXES)).toBe(3);
  expect(parallelRowCount([])).toBe(0);
  expect(parallelRowCount(AXES, 2.9)).toBe(2);
  expect(parallelRowCount(AXES, -4)).toBe(0);
});

test('the figure is brushed as soon as one axis keeps an interval', () => {
  expect(parallelIsBrushed(AXES, {})).toBe(false);
  expect(parallelIsBrushed(AXES, { logP: [[0, 1]] })).toBe(true);
});

test('a screen reader is told how many rows are drawn, on which axes', () => {
  expect(parallelFigureLabel(AXES, 1)).toBe(
    'Parallel coordinates of 1 row, on MW, logP.',
  );
  expect(parallelFigureLabel([], 1200)).toBe(
    'Parallel coordinates of 1,200 rows.',
  );
});
