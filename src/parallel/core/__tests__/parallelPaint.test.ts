import { expect, test } from 'vitest';

import type { ParallelAxisLayout } from '../parallelAxes.ts';
import { parallelAxisLayouts } from '../parallelAxes.ts';
import {
  PARALLEL_INCLUDED_ALPHA,
  paintParallelHighlights,
  paintParallelLines,
  preparePlotCanvas,
} from '../parallelPaint.ts';
import {
  PARALLEL_PALETTE_STEPS,
  parallelColorSteps,
  parallelPalette,
} from '../parallelPalette.ts';
import type { ParallelAxis } from '../parallelTypes.ts';

const MW = Float64Array.from([100, 200, 300, 400]);
const LOGP = Float64Array.from([0, 1, 2, 3]);
const TPSA = Float64Array.from([10, 20, 30, 40]);
const VALUES = [MW, LOGP, TPSA];
const LAYOUTS = layoutsOf([
  { id: 'mw', label: 'MW', values: MW },
  { id: 'logP', label: 'logP', values: LOGP },
  { id: 'tpsa', label: 'TPSA', values: TPSA },
]);

test('every row is one path of one move and a line per further axis', () => {
  const { context, log } = recorder();
  paintParallelLines(context, {
    layouts: LAYOUTS,
    values: VALUES,
    count: 4,
    line: '#111111',
    excluded: '#eeeeee',
  });

  expect(count(log, 'beginPath')).toBe(4);
  expect(count(log, 'moveTo')).toBe(4);
  expect(count(log, 'lineTo')).toBe(8);
  expect(exact(log, 'stroke')).toBe(4);
  // The first axis is flush with the left of the drawing area and the last
  // one with its right, so the first move lands on x = 0.
  expect(log[4]).toBe('moveTo 0,300');
  expect(log[5]).toBe('lineTo 360,300');
});

test('the rows a brush left out are one single stroked path underneath', () => {
  const { context, log } = recorder();
  paintParallelLines(context, {
    layouts: LAYOUTS,
    values: VALUES,
    count: 4,
    included: Uint8Array.from([1, 0, 0, 1]),
    line: '#111111',
    excluded: '#eeeeee',
  });

  expect(log.slice(0, 3)).toStrictEqual([
    'lineWidth=1',
    'strokeStyle=#eeeeee',
    'beginPath',
  ]);
  expect(count(log, 'beginPath')).toBe(3);
  expect(exact(log, 'stroke')).toBe(3);
  expect(count(log, 'moveTo')).toBe(4);
});

test('the kept rows are drawn at the alpha the figure reads them at, and it is put back', () => {
  const { context, log } = recorder();
  paintParallelLines(context, {
    layouts: LAYOUTS,
    values: VALUES,
    count: 4,
    line: '#111111',
    excluded: '#eeeeee',
  });

  expect(log).toContain(`globalAlpha=${PARALLEL_INCLUDED_ALPHA}`);
  expect(log.at(-1)).toBe('globalAlpha=1');
});

test('an axis a row has no number for is skipped rather than pinned to an end', () => {
  const gappy = Float64Array.from([Number.NaN, 1, 2, 3]);
  const { context, log } = recorder();
  paintParallelLines(context, {
    layouts: LAYOUTS,
    values: [MW, gappy, TPSA],
    count: 1,
    line: '#111111',
    excluded: '#eeeeee',
  });

  expect(count(log, 'moveTo')).toBe(1);
  expect(count(log, 'lineTo')).toBe(1);
});

test('fewer than two axes draws nothing at all', () => {
  const { context, log } = recorder();
  paintParallelLines(context, {
    layouts: LAYOUTS.slice(0, 1),
    values: VALUES,
    count: 4,
    line: '#111111',
    excluded: '#eeeeee',
  });

  expect(log).toStrictEqual([]);
});

test('the ramp is written about once per step rather than once per row', () => {
  const rows = 5000;
  const values = new Float64Array(rows);
  for (let row = 0; row < rows; row++) values[row] = row;
  const layouts = layoutsOf([
    { id: 'a', label: 'A', values },
    { id: 'b', label: 'B', values },
  ]);
  const palette = parallelPalette();
  const steps = parallelColorSteps({ values }, rows);
  const { context, log } = recorder();
  paintParallelLines(context, {
    layouts,
    values: [values, values],
    count: rows,
    steps,
    palette,
    line: '#111111',
    excluded: '#eeeeee',
  });

  expect(palette).toHaveLength(PARALLEL_PALETTE_STEPS + 1);
  expect(count(log, 'strokeStyle')).toBeLessThanOrEqual(
    PARALLEL_PALETTE_STEPS + 2,
  );
  expect(count(log, 'beginPath')).toBe(rows);
});

test('the colour of a row is read against the bounds the caller gave', () => {
  const values = Float64Array.from([0, 5, 10]);
  const steps = parallelColorSteps({ values, min: 0, max: 10 }, 3);

  expect([...steps]).toStrictEqual([0, 60, 120]);

  const clamped = parallelColorSteps({ values, min: 2, max: 8 }, 3);

  expect([...clamped]).toStrictEqual([0, 60, PARALLEL_PALETTE_STEPS]);
});

test('a singled out row is haloed, drawn over it, and dotted at every crossing', () => {
  const { context, log } = recorder();
  paintParallelHighlights(context, {
    highlights: [{ row: 2, color: '#2b6cb0' }],
    layouts: LAYOUTS,
    values: VALUES,
    halo: 'rgba(255, 255, 255, 0.85)',
  });

  expect(log.slice(0, 8)).toStrictEqual([
    'lineJoin=round',
    'lineCap=round',
    'beginPath',
    'moveTo 0,100',
    'lineTo 360,100',
    'lineTo 720,100',
    'strokeStyle=rgba(255, 255, 255, 0.85)',
    'lineWidth=5',
  ]);
  expect(log).toContain('strokeStyle=#2b6cb0');
  expect(log).toContain('lineWidth=2');
  expect(count(log, 'arc')).toBe(3);
  expect(exact(log, 'fill')).toBe(3);
});

test('a canvas is sized to the device grid and moved to the drawing area', () => {
  const { context, log } = recorder();
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => context,
  } as unknown as HTMLCanvasElement;

  expect(preparePlotCanvas(canvas, 800, 320)).toBe(context);
  expect(canvas.width).toBe(800);
  expect(canvas.height).toBe(320);
  expect(log).toStrictEqual(['resetTransform', 'scale 1,1', 'translate 54,26']);
  expect(preparePlotCanvas(null, 800, 320)).toBeNull();
});

function layoutsOf(axes: readonly ParallelAxis[]): ParallelAxisLayout[] {
  return parallelAxisLayouts(axes, 4, 720, 300);
}

function exact(log: readonly string[], name: string): number {
  let found = 0;
  for (const line of log) {
    if (line === name) found++;
  }
  return found;
}

function count(log: readonly string[], prefix: string): number {
  let found = 0;
  for (const line of log) {
    if (line.startsWith(prefix)) found++;
  }
  return found;
}

/**
 * As much of a canvas context as the painter touches, writing down what it was
 * asked to do — which is the only way to pin a canvas figure in a runtime that
 * has no canvas.
 * @returns The context to paint on, and the log it writes.
 */
function recorder(): { context: CanvasRenderingContext2D; log: string[] } {
  const log: string[] = [];
  const held = new Map<string, unknown>();
  const context = {};
  for (const name of [
    'strokeStyle',
    'fillStyle',
    'globalAlpha',
    'lineWidth',
    'lineJoin',
    'lineCap',
  ]) {
    Object.defineProperty(context, name, {
      get: () => held.get(name),
      set: (value: unknown) => {
        held.set(name, value);
        log.push(`${name}=${String(value)}`);
      },
    });
  }
  Object.assign(context, {
    beginPath: () => log.push('beginPath'),
    stroke: () => log.push('stroke'),
    fill: () => log.push('fill'),
    moveTo: (x: number, y: number) => log.push(`moveTo ${x},${y}`),
    lineTo: (x: number, y: number) => log.push(`lineTo ${x},${y}`),
    arc: (x: number, y: number, radius: number) =>
      log.push(`arc ${x},${y},${radius}`),
    resetTransform: () => log.push('resetTransform'),
    scale: (x: number, y: number) => log.push(`scale ${x},${y}`),
    translate: (x: number, y: number) => log.push(`translate ${x},${y}`),
  });
  return { context: context as CanvasRenderingContext2D, log };
}
