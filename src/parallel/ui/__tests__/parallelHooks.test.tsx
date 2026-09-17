import { expect, test } from 'vitest';

import type { ParallelAxisLayout } from '../../core/parallelAxes.ts';
import { parallelAxisLayouts } from '../../core/parallelAxes.ts';
import type { ParallelRange } from '../../core/parallelTypes.ts';
import type { ParallelGestureOptions } from '../useParallelGesture.ts';
import { useParallelGesture } from '../useParallelGesture.ts';

import { drag, mouseAt, pointerAt, probe } from './gestureProbe.tsx';

// Two axes six hundred pixels apart over a drawing area two hundred tall, so
// a value on the first axis is at y = 200 − value and the three rows run
// across the middle of the figure.
const MW = Float64Array.from([50, 100, 150]);
const LOGP = Float64Array.from([0.5, 1, 1.5]);
const VALUES = [MW, LOGP];
const LAYOUTS: ParallelAxisLayout[] = parallelAxisLayouts(
  [
    { id: 'mw', label: 'MW', values: MW, domain: [0, 200] },
    { id: 'logP', label: 'logP', values: LOGP, domain: [0, 2] },
  ],
  3,
  600,
  200,
);

test('a drag down an axis reports the interval it kept, low value first', () => {
  const changes: Array<[string, ParallelRange | null]> = [];
  const previews: Array<ParallelRange | null> = [];
  const { value } = probe(() =>
    useParallelGesture(
      options({
        onRangeChange: (axis, range) => changes.push([axis, range]),
        onRangePreview: (_axis, range) => previews.push(range),
      }),
    ),
  );
  drag(value, { x: 0, y: 40 }, { x: 0, y: 140 });

  expect(changes).toStrictEqual([['mw', [60, 160]]]);
  expect(previews.at(-1)).toStrictEqual([60, 160]);
  expect(previews.length).toBeGreaterThan(1);
});

test('a press between two axes takes nothing and reports nothing', () => {
  const changes: Array<[string, ParallelRange | null]> = [];
  const { value } = probe(() =>
    useParallelGesture(
      options({ onRangeChange: (axis, range) => changes.push([axis, range]) }),
    ),
  );
  drag(value, { x: 300, y: 40 }, { x: 300, y: 140 });

  expect(changes).toStrictEqual([]);
});

test('a press above or below the drawing area takes nothing', () => {
  const changes: Array<[string, ParallelRange | null]> = [];
  const { value } = probe(() =>
    useParallelGesture(
      options({ onRangeChange: (axis, range) => changes.push([axis, range]) }),
    ),
  );
  drag(value, { x: 0, y: -10 }, { x: 0, y: 100 });
  drag(value, { x: 0, y: 260 }, { x: 0, y: 100 });

  expect(changes).toStrictEqual([]);
});

test('a press outside an existing band clears the axis', () => {
  const changes: Array<[string, ParallelRange | null]> = [];
  const { value } = probe(() =>
    useParallelGesture(
      options({
        ranges: { mw: [60, 160] },
        onRangeChange: (axis, range) => changes.push([axis, range]),
      }),
    ),
  );
  drag(value, { x: 0, y: 180 }, { x: 0, y: 180 });

  expect(changes).toStrictEqual([['mw', null]]);
});

test('a band is moved whole, and stops rather than being squashed at the end', () => {
  const moved: Array<ParallelRange | null> = [];
  const { value } = probe(() =>
    useParallelGesture(
      options({
        ranges: { mw: [60, 160] },
        onRangeChange: (_axis, range) => moved.push(range),
      }),
    ),
  );
  drag(value, { x: 0, y: 90 }, { x: 0, y: 110 });
  drag(value, { x: 0, y: 90 }, { x: 0, y: 900 });

  expect(moved).toStrictEqual([
    [40, 140],
    [0, 100],
  ]);
});

test('an edge is dragged on its own, and the band is held inside the figure', () => {
  const resized: Array<ParallelRange | null> = [];
  const { value } = probe(() =>
    useParallelGesture(
      options({
        ranges: { mw: [60, 160] },
        onRangeChange: (_axis, range) => resized.push(range),
      }),
    ),
  );
  // The band runs from y = 40 to y = 140; take its top edge up past the end
  // of the axis, which is the gesture the reader makes to keep "everything
  // above" without having to aim.
  drag(value, { x: 0, y: 41 }, { x: 0, y: -60 });

  expect(resized).toStrictEqual([[60, 200]]);
});

test('a drag the browser takes away reports no interval at all', () => {
  const changes: Array<[string, ParallelRange | null]> = [];
  const { value } = probe(() =>
    useParallelGesture(
      options({ onRangeChange: (axis, range) => changes.push([axis, range]) }),
    ),
  );
  value.surface.onPointerDown(pointerAt(0, 40));
  value.surface.onPointerMove(pointerAt(0, 140));
  value.surface.onPointerCancel(pointerAt(0, 140));

  expect(changes).toStrictEqual([]);
});

test('a free move reports the row under the pointer, and nothing off the lines', () => {
  const hovers: number[] = [];
  const { value } = probe(() =>
    useParallelGesture(
      options({ onHoverChange: (index) => hovers.push(index) }),
    ),
  );
  value.surface.onPointerMove(pointerAt(300, 100));
  value.surface.onPointerMove(pointerAt(300, 99));
  value.surface.onPointerMove(pointerAt(300, 20));
  value.surface.onPointerLeave(pointerAt(300, 20));

  // The second move is on the same line, so nothing is reported twice.
  expect(hovers).toStrictEqual([1, -1]);
});

test('a click picks the nearest line, and the click that ended a brush does not', () => {
  const clicks: number[] = [];
  const { value } = probe(() =>
    useParallelGesture(options({ onRowClick: (index) => clicks.push(index) })),
  );
  value.onClick(mouseAt(300, 100));
  value.onClick(mouseAt(300, 20));
  drag(value, { x: 0, y: 40 }, { x: 0, y: 140 });
  value.onClick(mouseAt(300, 100));

  expect(clicks).toStrictEqual([1, -1]);
});

test('the bands drawn are the intervals in force, and the figure adds none of its own', () => {
  const { value } = probe(() =>
    useParallelGesture(options({ ranges: { mw: [60, 160] } })),
  );

  expect(value.bands.get('mw')).toStrictEqual({ top: 40, bottom: 140 });
  expect(value.bands.has('logP')).toBe(false);
  expect(value.brushing).toBe(false);
});

function options(
  extra: Partial<ParallelGestureOptions> = {},
): ParallelGestureOptions {
  return {
    layouts: LAYOUTS,
    values: VALUES,
    count: 3,
    innerHeight: 200,
    included: null,
    ranges: {},
    onRangeChange: () => {
      // The tests that care pass their own.
    },
    ...extra,
  };
}
