import { expect, test } from 'vitest';

import { parallelAxisLayouts } from '../parallelAxes.ts';
import { paintParallelLines } from '../parallelPaint.ts';
import {
  PARALLEL_PALETTE_STEPS,
  PARALLEL_PALETTE_UNKNOWN,
  parallelColorSteps,
  parallelPalette,
} from '../parallelPalette.ts';
import type { ParallelAxis } from '../parallelTypes.ts';

const LINE = '#111111';

test('a row whose colouring value is unknown takes a step no colour indexes', () => {
  const values = Float64Array.from([-3.2, 0.5, 2.1, 4.4, Number.NaN]);

  expect([...parallelColorSteps({ values }, 5)]).toStrictEqual([
    0,
    58,
    84,
    PARALLEL_PALETTE_STEPS,
    PARALLEL_PALETTE_UNKNOWN,
  ]);
  expect(parallelPalette()[PARALLEL_PALETTE_UNKNOWN]).toBeUndefined();
});

test('a logarithmic ramp leaves an unknown value out of the ramp too', () => {
  const values = Float64Array.from([1, 10, 100, Number.NaN]);

  expect([
    ...parallelColorSteps({ values, logarithmic: true }, 4),
  ]).toStrictEqual([0, 60, PARALLEL_PALETTE_STEPS, PARALLEL_PALETTE_UNKNOWN]);
});

test('a row the colouring column does not reach is unknown, not the low end', () => {
  const values = Float64Array.from([0, 10]);

  expect([...parallelColorSteps({ values }, 3)]).toStrictEqual([
    0,
    PARALLEL_PALETTE_STEPS,
    PARALLEL_PALETTE_UNKNOWN,
  ]);
});

test('a line whose colour is unknown is drawn in the neutral ink', () => {
  const left = Float64Array.from([100, 200, 300]);
  const right = Float64Array.from([1, 2, 3]);
  const color = Float64Array.from([0, 10, Number.NaN]);
  const layouts = parallelAxisLayouts(
    [column('a', 'A', left), column('b', 'B', right)],
    3,
    600,
    300,
  );
  const palette = parallelPalette();
  const { context, log } = recorder();

  paintParallelLines(context, {
    layouts,
    values: [left, right],
    count: 3,
    steps: parallelColorSteps({ values: color }, 3),
    palette,
    line: LINE,
    excluded: '#eeeeee',
  });

  // The third row's quantity is unknown; it must not repeat the ink of the
  // first, which is the smallest value in the set.
  expect(log).toStrictEqual([
    LINE,
    palette[0] as string,
    palette[PARALLEL_PALETTE_STEPS] as string,
    LINE,
  ]);
});

function column(
  id: string,
  label: string,
  values: ArrayLike<number>,
): ParallelAxis {
  return { id, label, values };
}

/**
 * As much of a canvas context as the painter touches, writing down the ink it
 * chose for each line and nothing else.
 * @returns The context to paint on, and the inks it wrote.
 */
function recorder(): { context: CanvasRenderingContext2D; log: string[] } {
  const log: string[] = [];
  const held = new Map<string, unknown>();
  const context = {};
  for (const name of ['strokeStyle', 'globalAlpha', 'lineWidth']) {
    Object.defineProperty(context, name, {
      get: () => held.get(name),
      set: (value: unknown) => {
        held.set(name, value);
        if (name === 'strokeStyle') log.push(String(value));
      },
    });
  }
  Object.assign(context, {
    beginPath: () => undefined,
    stroke: () => undefined,
    moveTo: () => undefined,
    lineTo: () => undefined,
  });
  return { context: context as CanvasRenderingContext2D, log };
}
