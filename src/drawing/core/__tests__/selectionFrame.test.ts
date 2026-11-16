import { expect, test } from 'vitest';

import {
  frameCorners,
  frameHandleAt,
  frameHandles,
  frameTransform,
  framedBox,
} from '../selectionFrame.ts';

const FRAME = { x: 0, y: 0, width: 100, height: 50 };

test('the frame stands off what it frames, by six screen pixels', () => {
  expect(framedBox({ x: 10, y: 20, width: 40, height: 30 }, 2)).toStrictEqual({
    x: -2,
    y: 8,
    width: 64,
    height: 54,
  });
  expect(framedBox(undefined, 1)).toBeUndefined();
  expect(framedBox({ x: 0, y: 0, width: 0.5, height: 0.5 }, 1)).toBeUndefined();
});

test('a corner scales about the corner across from it, keeping proportions', () => {
  expect(
    frameTransform(FRAME, 'se', { x: 100, y: 50 }, { x: 200, y: 100 }, false),
  ).toStrictEqual({ pivot: { x: 0, y: 0 }, scale: 2, rotation: 0 });
  // Off the diagonal, the pointer is followed along it.
  expect(
    frameTransform(FRAME, 'nw', { x: 0, y: 0 }, { x: 50, y: 25 }, false),
  ).toStrictEqual({ pivot: { x: 100, y: 50 }, scale: 0.5, rotation: 0 });
  // Dragged through the pivot, the selection stops at 4 units across.
  expect(
    frameTransform(FRAME, 'se', { x: 100, y: 50 }, { x: -50, y: -50 }, false)
      .scale,
  ).toBe(0.04);
});

test('the round handle turns about the middle, by 15° unless Shift is held', () => {
  const start = { x: 50, y: -24 };
  // From straight above the middle to 50° clockwise of it.
  const angle = (50 * Math.PI) / 180;
  const pointer = {
    x: 50 + 40 * Math.sin(angle),
    y: 25 - 40 * Math.cos(angle),
  };

  expect(frameTransform(FRAME, 'rotate', start, pointer, false)).toStrictEqual({
    pivot: { x: 50, y: 25 },
    scale: 1,
    rotation: 45,
  });
  expect(frameTransform(FRAME, 'rotate', start, pointer, true).rotation).toBe(
    50,
  );
});

test('a handle is found near where it is drawn, and the frame follows a turn', () => {
  expect(frameHandles(FRAME, 1)[0]).toStrictEqual({
    handle: 'rotate',
    point: { x: 50, y: -24 },
  });
  expect(frameHandleAt(FRAME, { x: 101, y: 49 }, 1)).toBe('se');
  expect(frameHandleAt(FRAME, { x: 50, y: -23 }, 1)).toBe('rotate');
  expect(frameHandleAt(FRAME, { x: 50, y: 25 }, 1)).toBeUndefined();
  expect(
    frameCorners(FRAME, { pivot: { x: 0, y: 0 }, scale: 1, rotation: 90 }),
  ).toStrictEqual([
    { x: 0, y: 0 },
    { x: 0, y: 100 },
    { x: -50, y: 100 },
    { x: -50, y: 0 },
  ]);
});
