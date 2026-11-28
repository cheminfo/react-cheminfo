// @vitest-environment jsdom
import { expect, test } from 'vitest';

import {
  CLICK_SLOP,
  followPointer,
  inGesture,
  pastClickSlop,
} from '../followPointer.ts';

function pointer(type: string): PointerEvent {
  return new Event(type) as PointerEvent;
}

test('a drag holds the canvas until it ends, and ends once however it ends', () => {
  const target = document.createElement('div');
  const captured: number[] = [];
  target.setPointerCapture = (id: number) => {
    captured.push(id);
  };
  const seen: string[] = [];
  followPointer(target, 7, {
    move: (event) => {
      seen.push(event.type);
    },
    end: (event) => {
      seen.push(`end ${event.type}`);
    },
  });

  expect(captured).toStrictEqual([7]);
  expect(inGesture()).toBe(true);

  target.dispatchEvent(pointer('pointermove'));
  target.dispatchEvent(pointer('pointercancel'));
  target.dispatchEvent(pointer('pointerup'));
  target.dispatchEvent(pointer('pointermove'));

  expect(seen).toStrictEqual(['pointermove', 'end pointercancel']);
  expect(inGesture()).toBe(false);
});

test('a press becomes a drag once the pointer has gone 3 pixels', () => {
  const at = { clientX: 10, clientY: 10 };

  expect(CLICK_SLOP).toBe(3);
  expect(pastClickSlop(at, { clientX: 12, clientY: 12 })).toBe(false);
  expect(pastClickSlop(at, { clientX: 13, clientY: 10 })).toBe(true);
  expect(pastClickSlop(at, { clientX: 13, clientY: 10 }, 4)).toBe(false);
});
