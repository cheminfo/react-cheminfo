import { expect, test } from 'vitest';

import type { ParallelAxisLayout } from '../parallelAxes.ts';
import { parallelAxisLayouts } from '../parallelAxes.ts';
import { parallelNearestRow } from '../parallelHit.ts';
import { traceParallelRow } from '../parallelPaint.ts';
import type { ParallelAxis } from '../parallelTypes.ts';

// Three axes at x = 0, 300 and 600 over a 200 px drawing area, each reading
// 0 at the bottom and 200 at the top, so a value lands on y = 200 − value.
// Row 0 has no value on the middle axis; row 1 runs just under it.
const LEFT = Float64Array.from([100, 95]);
const MIDDLE = Float64Array.from([Number.NaN, 98]);
const RIGHT = Float64Array.from([100, 100]);
const VALUES = [LEFT, MIDDLE, RIGHT];
const LAYOUTS = layoutsOf([
  column('a', 'A', LEFT),
  column('b', 'B', MIDDLE),
  column('c', 'C', RIGHT),
]);

test('a gap on a middle axis breaks the line rather than bridging the axis', () => {
  const { context, log } = tracer();

  traceParallelRow(context, 0, LAYOUTS, VALUES);

  expect(log).toStrictEqual(['moveTo 0,100', 'moveTo 600,100']);
});

test('nothing is painted across an axis the row has no value on', () => {
  const { context, log } = tracer();

  traceParallelRow(context, 0, LAYOUTS, VALUES);

  // The hit test answers nothing anywhere between the two outer axes, so the
  // painter must leave nothing there either.
  for (const x of [100, 200, 300, 400, 500]) {
    expect(parallelNearestRow({ x, y: 100 }, LAYOUTS, VALUES, 1)).toBe(-1);
  }

  expect(log.some((line) => line.startsWith('lineTo'))).toBe(false);
});

test('a row with values on every axis is still one unbroken line', () => {
  const { context, log } = tracer();

  traceParallelRow(context, 1, LAYOUTS, VALUES);

  expect(log).toStrictEqual([
    'moveTo 0,105',
    'lineTo 300,102',
    'lineTo 600,100',
  ]);
});

function column(
  id: string,
  label: string,
  values: ArrayLike<number>,
): ParallelAxis {
  return { id, label, values, domain: [0, 200] };
}

function layoutsOf(axes: readonly ParallelAxis[]): ParallelAxisLayout[] {
  return parallelAxisLayouts(axes, 2, 600, 200);
}

/**
 * As much of a canvas context as tracing one row touches.
 * @returns The context to trace onto, and the log it writes.
 */
function tracer(): { context: CanvasRenderingContext2D; log: string[] } {
  const log: string[] = [];
  const context = {
    moveTo: (x: number, y: number) => log.push(`moveTo ${x},${y}`),
    lineTo: (x: number, y: number) => log.push(`lineTo ${x},${y}`),
  };
  return { context: context as unknown as CanvasRenderingContext2D, log };
}
