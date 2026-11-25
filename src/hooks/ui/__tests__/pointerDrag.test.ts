// @vitest-environment jsdom
import { expect, test } from 'vitest';

import { startPointerDrag, tryCapturePointer } from '../pointerDrag.ts';

/**
 * An element whose pointer capture the test keeps, as a browser keeps it:
 * a pointer it no longer tracks cannot be captured.
 * @param tracked - The pointers the browser tracks.
 * @returns The element and the pointers it holds.
 */
function surface(tracked: readonly number[]) {
  const element = document.createElement('div');
  const held = new Set<number>();
  Object.assign(element, {
    setPointerCapture: (id: number) => {
      if (!tracked.includes(id)) {
        throw new DOMException('no such pointer', 'NotFoundError');
      }
      held.add(id);
    },
    hasPointerCapture: (id: number) => held.has(id),
    releasePointerCapture: (id: number) => {
      held.delete(id);
    },
  });
  return { element, held };
}

function pointer(type: string, pointerId: number, clientX = 0): Event {
  return Object.assign(new Event(type), { pointerId, clientX });
}

test('a drag follows its own pointer, ends once on its release, and lets the pointer go', () => {
  const { element, held } = surface([1, 2]);
  const moves: number[] = [];
  let ends = 0;
  startPointerDrag(
    { currentTarget: element, pointerId: 1 },
    {
      onMove: (event) => moves.push(event.clientX),
      onEnd: () => {
        ends += 1;
      },
    },
  );
  const capturedDuring = held.has(1);
  element.dispatchEvent(pointer('pointermove', 1, 10));
  element.dispatchEvent(pointer('pointermove', 2, 99));
  element.dispatchEvent(pointer('pointerup', 2));
  element.dispatchEvent(pointer('pointerup', 1));
  element.dispatchEvent(pointer('pointercancel', 1));
  element.dispatchEvent(pointer('pointermove', 1, 20));

  expect([moves, ends, capturedDuring, held.has(1)]).toStrictEqual([
    [10],
    1,
    true,
    false,
  ]);
});

test('a cancel or a lost capture ends a drag; a pointer already gone ends it at once', () => {
  const { element } = surface([1]);
  const ended: string[] = [];
  startPointerDrag(
    { currentTarget: element, pointerId: 1 },
    { onMove: () => undefined, onEnd: () => ended.push('cancel') },
  );
  element.dispatchEvent(pointer('pointercancel', 1));
  startPointerDrag(
    { currentTarget: element, pointerId: 1 },
    { onMove: () => undefined, onEnd: () => ended.push('lost') },
  );
  element.dispatchEvent(pointer('lostpointercapture', 1));
  startPointerDrag(
    { currentTarget: element, pointerId: 7 },
    { onMove: () => undefined, onEnd: () => ended.push('gone') },
  );

  expect(ended).toStrictEqual(['cancel', 'lost', 'gone']);
});

test('a pointer the browser no longer tracks is not captured; any other refusal is thrown on', () => {
  const { element } = surface([3]);
  const broken = document.createElement('div');
  Object.assign(broken, {
    setPointerCapture: () => {
      throw new TypeError('a defect');
    },
  });

  expect([
    tryCapturePointer(element, 3),
    tryCapturePointer(element, 4),
  ]).toStrictEqual([true, false]);
  expect(() => tryCapturePointer(broken, 1)).toThrow('a defect');
});
