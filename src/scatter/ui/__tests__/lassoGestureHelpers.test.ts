/**
 * The two edges of a gesture surface a test in a browser never reaches: an
 * element that cannot be measured, and a pointer gone before it is claimed.
 */

import type { PointerEvent as ReactPointerEvent } from 'react';
import { expect, test } from 'vitest';

import { capturePointer, surfacePosition } from '../lassoGesture.ts';

test('a surface that cannot be measured reports its own corner', () => {
  const event = { currentTarget: {} as Element, clientX: 40, clientY: 70 };

  expect(surfacePosition(event, 60, 5)).toStrictEqual({ x: 60, y: 5 });
});

test('a measured surface reports the point in the space the points were measured in', () => {
  const currentTarget = {
    getBoundingClientRect: () => ({ left: 10, top: 20 }),
  } as unknown as Element;

  expect(
    surfacePosition({ currentTarget, clientX: 40, clientY: 70 }, 60, 5),
  ).toStrictEqual({ x: 90, y: 55 });
});

test('a pointer already gone when the drag claims it is let go quietly', () => {
  const claimed: number[] = [];
  const gone = {
    pointerId: 7,
    currentTarget: {
      setPointerCapture: (id: number) => {
        claimed.push(id);
        throw new DOMException('No active pointer', 'NotFoundError');
      },
    },
  } as unknown as ReactPointerEvent<Element>;
  const unmeasured = {
    pointerId: 8,
    currentTarget: {},
  } as unknown as ReactPointerEvent<Element>;

  expect(() => capturePointer(gone)).not.toThrow();
  expect(() => capturePointer(unmeasured)).not.toThrow();
  expect(claimed).toStrictEqual([7]);
});
