import { expect, test } from 'vitest';

import type { ParallelAxisLayout } from '../parallelAxes.ts';
import { parallelAxisLayouts } from '../parallelAxes.ts';
import { parallelNearestRow, parallelSegmentAt } from '../parallelHit.ts';
import type { ParallelAxis } from '../parallelTypes.ts';

// At an inner height of 200 the lines run from y = 200 − mw on the left to
// y = 200 − 100 × logP on the right, so row 0 sits low, row 1 across the
// middle and row 2 high.
const MW = Float64Array.from([50, 100, 150]);
const LOGP = Float64Array.from([0.5, 1, 1.5]);
const VALUES = [MW, LOGP];
const LAYOUTS = layoutsOf(
  [column('mw', 'MW', MW, [0, 200]), column('logP', 'logP', LOGP, [0, 2])],
  400,
);

const LOW = 0;
const MIDDLE = 1;
const HIGH = 2;

test('the row running under the pointer is picked', () => {
  expect(parallelNearestRow({ x: 200, y: 100 }, LAYOUTS, VALUES, 3)).toBe(
    MIDDLE,
  );
});

test('a pointer on an axis picks the row at that value', () => {
  expect(parallelNearestRow({ x: 0, y: 150 }, LAYOUTS, VALUES, 3)).toBe(LOW);
  expect(parallelNearestRow({ x: 400, y: 50 }, LAYOUTS, VALUES, 3)).toBe(HIGH);
});

test('the closest of two neighbouring lines wins', () => {
  expect(parallelNearestRow({ x: 0, y: 104 }, LAYOUTS, VALUES, 3)).toBe(MIDDLE);
  expect(parallelNearestRow({ x: 0, y: 146 }, LAYOUTS, VALUES, 3)).toBe(LOW);
});

test('a pointer further than the tolerance picks nothing', () => {
  expect(parallelNearestRow({ x: 200, y: 20 }, LAYOUTS, VALUES, 3)).toBe(-1);
});

test('a pointer beyond the first or the last axis picks nothing', () => {
  expect(parallelNearestRow({ x: -20, y: 100 }, LAYOUTS, VALUES, 3)).toBe(-1);
  expect(parallelNearestRow({ x: 460, y: 100 }, LAYOUTS, VALUES, 3)).toBe(-1);
});

test('the segment the pointer sits in is the one hit tested', () => {
  const psa = Float64Array.from([50, 0]);
  const mw = Float64Array.from([100, 100]);
  const logP = Float64Array.from([1, 1]);
  const layouts = layoutsOf(
    [
      column('mw', 'MW', mw, [0, 200]),
      column('logP', 'logP', logP, [0, 2]),
      column('psa', 'PSA', psa, [0, 100]),
    ],
    200,
  );
  const values = [mw, logP, psa];

  // Both rows share the first segment, so only the second one separates them:
  // at x = 150 the bent one has already dived towards the bottom.
  expect(parallelNearestRow({ x: 150, y: 100 }, layouts, values, 2)).toBe(0);
  expect(parallelNearestRow({ x: 150, y: 150 }, layouts, values, 2)).toBe(1);
  expect(parallelSegmentAt(150, layouts)).toStrictEqual({ left: 1, right: 2 });
});

test('a single axis cannot be hit tested', () => {
  expect(
    parallelNearestRow({ x: 0, y: 100 }, LAYOUTS.slice(0, 1), VALUES, 3),
  ).toBe(-1);
  expect(parallelNearestRow({ x: 0, y: 100 }, [], VALUES, 3)).toBe(-1);
  expect(parallelSegmentAt(0, LAYOUTS.slice(0, 1))).toBeNull();
});

test('an empty library picks nothing', () => {
  expect(parallelNearestRow({ x: 200, y: 100 }, LAYOUTS, VALUES, 0)).toBe(-1);
});

test('a row a brush left out cannot be pointed at', () => {
  const kept = Uint8Array.from([1, 0, 1]);

  expect(parallelNearestRow({ x: 200, y: 100 }, LAYOUTS, VALUES, 3, kept)).toBe(
    -1,
  );
  expect(parallelNearestRow({ x: 0, y: 150 }, LAYOUTS, VALUES, 3, kept)).toBe(
    LOW,
  );
});

test('a wider tolerance picks a line the default would miss', () => {
  expect(parallelNearestRow({ x: 200, y: 90 }, LAYOUTS, VALUES, 3)).toBe(-1);
  expect(
    parallelNearestRow({ x: 200, y: 90 }, LAYOUTS, VALUES, 3, undefined, 20),
  ).toBe(MIDDLE);
});

function column(
  id: string,
  label: string,
  values: ArrayLike<number>,
  domain: readonly [number, number],
): ParallelAxis {
  return { id, label, values, domain };
}

function layoutsOf(
  axes: readonly ParallelAxis[],
  innerWidth: number,
): ParallelAxisLayout[] {
  return parallelAxisLayouts(axes, 3, innerWidth, 200);
}
