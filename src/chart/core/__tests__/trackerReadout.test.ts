import { expect, test } from 'vitest';

import { plotRect } from '../chartGeometry.ts';
import {
  READOUT_GAP,
  READOUT_WIDTH,
  readoutPlacement,
} from '../trackerReadout.ts';

const plot = plotRect({ width: 660, height: 264 });

test('the readout stands to the right of the crosshair and above the pointer', () => {
  expect(readoutPlacement({ x: 100, y: 120 }, plot)).toStrictEqual({
    x: 106,
    y: 114,
    anchor: 'start',
  });
});

test('a readout that would cross the right edge is written the other way', () => {
  expect(readoutPlacement({ x: 600, y: 120 }, plot)).toStrictEqual({
    x: 594,
    y: 114,
    anchor: 'end',
  });
});

test('it flips at the pixel where the last of it would leave the plot', () => {
  const last = plot.right - READOUT_GAP - READOUT_WIDTH;

  expect(readoutPlacement({ x: last, y: 120 }, plot).anchor).toBe('start');
  expect(readoutPlacement({ x: last + 1, y: 120 }, plot).anchor).toBe('end');
});

test('a pointer near the top writes the first line under the edge, not over it', () => {
  expect(readoutPlacement({ x: 100, y: 20 }, plot).y).toBe(21);
});

test('a pointer near the bottom keeps the last line inside the plot', () => {
  expect(readoutPlacement({ x: 100, y: 228 }, plot).y).toBe(219);
  expect(readoutPlacement({ x: 100, y: 228 }, plot, 1).y).toBe(222);
});

test('a plot too short for both lines keeps the m/z rather than the intensity', () => {
  expect(
    readoutPlacement({ x: 64, y: 24 }, plotRect({ width: 0, height: 0 })),
  ).toStrictEqual({ x: 58, y: 21, anchor: 'end' });
});
