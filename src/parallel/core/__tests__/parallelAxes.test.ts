import { expect, test } from 'vitest';

import type { ParallelAxisLayout } from '../parallelAxes.ts';
import {
  PARALLEL_MARGIN,
  parallelAxisLayouts,
  parallelValueToY,
  parallelYToValue,
} from '../parallelAxes.ts';
import { parallelExtent } from '../parallelExtent.ts';
import type { ParallelAxis } from '../parallelTypes.ts';
import { parallelAxisOf } from '../parallelTypes.ts';

const MOLECULES = [
  { mw: 100, logP: -1.5, logS: -1.5, donors: 0 },
  { mw: 300, logP: 2.5, logS: -1.5, donors: 2 },
  { mw: 500, logP: 0.5, logS: -1.5, donors: 1 },
];

const COLUMNS = {
  mw: axisOf('mw', 'MW', (row) => row.mw),
  logP: axisOf('logP', 'logP', (row) => row.logP),
  logS: axisOf('logS', 'logS', (row) => row.logS),
  donors: axisOf('donors', 'H donors', (row) => row.donors),
};

test('two axes are placed at both ends of the drawing area', () => {
  const layouts = parallelAxisLayouts([COLUMNS.mw, COLUMNS.logP], 3, 800, 200);

  expect(positions(layouts)).toStrictEqual([0, 800]);
  expect(extents(layouts)).toStrictEqual([
    [100, 500],
    [-1.5, 2.5],
  ]);
});

test('eight axes are evenly spaced', () => {
  const axes: ParallelAxis[] = [];
  for (let index = 0; index < 8; index++) {
    axes.push({ ...COLUMNS.mw, id: `axis${index}` });
  }
  const layouts = parallelAxisLayouts(axes, 3, 700, 200);

  expect(positions(layouts)).toStrictEqual([
    0, 100, 200, 300, 400, 500, 600, 700,
  ]);
});

test('a single axis is centred', () => {
  const layouts = parallelAxisLayouts([COLUMNS.mw], 3, 640, 200);

  expect(positions(layouts)).toStrictEqual([320]);
  expect(extents(layouts)).toStrictEqual([[100, 500]]);
});

test('a constant column is padded to a half unit on each side', () => {
  const layouts = parallelAxisLayouts([COLUMNS.logS], 3, 100, 200);

  expect(extents(layouts)).toStrictEqual([[-2, -1]]);
});

test('an empty library still yields a drawable extent', () => {
  const layouts = parallelAxisLayouts(
    [{ id: 'donors', label: 'H donors', values: new Float64Array(0) }],
    0,
    200,
    200,
  );

  expect(extents(layouts)).toStrictEqual([[-0.5, 0.5]]);
});

test('a column of nothing but missing values is drawable too', () => {
  expect(
    parallelExtent(Float64Array.from([Number.NaN, Number.NaN]), 2),
  ).toStrictEqual({ min: -0.5, max: 0.5 });
});

test('a missing value never becomes the end of an axis', () => {
  expect(
    parallelExtent(Float64Array.from([3, Number.NaN, 7, Number.NaN]), 4),
  ).toStrictEqual({ min: 3, max: 7 });
});

test('no axis is laid out when no column is requested', () => {
  expect(parallelAxisLayouts([], 3, 800, 200)).toStrictEqual([]);
});

test('a caller domain wins over the column and is ordered low first', () => {
  const layouts = parallelAxisLayouts(
    [{ ...COLUMNS.mw, domain: [1, 0] }],
    3,
    100,
    200,
  );

  expect(extents(layouts)).toStrictEqual([[0, 1]]);
});

test('the maximum sits at the top of the axis and the minimum at the bottom', () => {
  const axis = axisAt(0, 10, 200);

  expect(parallelValueToY(10, axis)).toBe(0);
  expect(parallelValueToY(5, axis)).toBe(100);
  expect(parallelValueToY(0, axis)).toBe(200);
  expect(parallelValueToY(2.5, axis)).toBe(150);
});

test('a value outside the extent maps outside the drawing area', () => {
  const axis = axisAt(0, 10, 200);

  expect(parallelValueToY(12, axis)).toBe(-40);
  expect(parallelValueToY(-1, axis)).toBeCloseTo(220, 9);
});

test('a pixel maps back to the value that produced it', () => {
  const axis = axisAt(-3.25, 8.75, 264);
  for (const value of [-3.25, -1, 0, 1.125, 4.5, 8.75]) {
    expect(parallelYToValue(parallelValueToY(value, axis), axis)).toBeCloseTo(
      value,
      9,
    );
  }
});

test('a flat drawing area cannot be inverted', () => {
  const axis = axisAt(0, 10, 0);

  expect(parallelValueToY(5, axis)).toBe(0);
  expect(parallelYToValue(0, axis)).toBe(10);
});

test('a logarithmic axis places a decade at every quarter of its height', () => {
  const axis = axisAt(1, 10_000, 300, 'log');

  expect(parallelValueToY(10_000, axis)).toBe(0);
  expect(parallelValueToY(100, axis)).toBeCloseTo(150, 9);
  expect(parallelValueToY(1, axis)).toBe(300);
  // Anything at or below the low end is pinned there rather than sent to
  // minus infinity, which would take the whole line with it.
  expect(parallelValueToY(0, axis)).toBe(300);
  expect(parallelYToValue(150, axis)).toBeCloseTo(100, 9);
});

test('the margin is the room the names and the tick labels need', () => {
  expect(PARALLEL_MARGIN).toStrictEqual({
    top: 26,
    right: 54,
    bottom: 22,
    left: 54,
  });
});

test('an axis built from rows reads its field once per row', () => {
  let reads = 0;
  const axis = parallelAxisOf(MOLECULES, {
    id: 'mw',
    label: 'MW',
    unit: 'g/mol',
    value: (row) => {
      reads++;
      return row.mw;
    },
  });

  expect(reads).toBe(3);
  expect(axis.unit).toBe('g/mol');
  expect([...(axis.values as Float64Array)]).toStrictEqual([100, 300, 500]);
});

function axisOf(
  id: string,
  label: string,
  value: (row: (typeof MOLECULES)[number]) => number,
): ParallelAxis {
  return parallelAxisOf(MOLECULES, { id, label, value });
}

function axisAt(
  min: number,
  max: number,
  innerHeight: number,
  scale?: 'linear' | 'log',
): ParallelAxisLayout {
  const layouts = parallelAxisLayouts(
    [
      {
        id: 'mw',
        label: 'MW',
        values: new Float64Array(0),
        domain: [min, max],
        scale,
      },
    ],
    0,
    0,
    innerHeight,
  );
  return layouts[0] as ParallelAxisLayout;
}

function positions(layouts: readonly ParallelAxisLayout[]): number[] {
  const found: number[] = [];
  for (const layout of layouts) found.push(layout.x);
  return found;
}

function extents(
  layouts: readonly ParallelAxisLayout[],
): Array<[number, number]> {
  const found: Array<[number, number]> = [];
  for (const layout of layouts) found.push([layout.min, layout.max]);
  return found;
}
