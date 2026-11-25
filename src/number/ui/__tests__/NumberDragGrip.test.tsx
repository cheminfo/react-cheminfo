// @vitest-environment jsdom
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { NumberDragGripProps } from '../NumberDragGrip.tsx';
import { NumberDragGrip } from '../NumberDragGrip.tsx';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

/**
 * The grip drawn, and what it reported.
 * @param props - The props that differ from a value of 1.5 in steps of 0.1.
 * @returns The grip, the values it reported and when each drag ended.
 */
function grip(props: Partial<NumberDragGripProps>): {
  element: HTMLSpanElement;
  changes: number[];
  ends: number[];
} {
  const changes: number[] = [];
  const ends: number[] = [];
  act(() =>
    root.render(
      <NumberDragGrip
        value={1.5}
        step={0.1}
        label="Drag sideways to change the value"
        onChange={(value) => changes.push(value)}
        onDragEnd={() => ends.push(changes.length)}
        {...props}
      />,
    ),
  );
  const element = host.querySelector<HTMLSpanElement>('.number-drag-grip');
  if (element === null) throw new Error('no grip');
  // jsdom has no pointer capture: the grip asks for it, nothing more.
  element.setPointerCapture = () => undefined;
  return { element, changes, ends };
}

function pointer(
  element: Element,
  type: string,
  clientX: number,
  init: { shiftKey?: boolean } = {},
): void {
  const event = new MouseEvent(type, {
    bubbles: true,
    clientX,
    button: 0,
    ...init,
  });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  act(() => {
    element.dispatchEvent(event);
  });
}

test('dragged sideways, the grip moves the number a step a pixel, ten with Shift, on the grid of its step, then says it was let go', () => {
  const { element, changes, ends } = grip({});
  pointer(element, 'pointerdown', 100);
  pointer(element, 'pointermove', 103);
  pointer(element, 'pointermove', 101);
  pointer(element, 'pointermove', 102, { shiftKey: true });
  pointer(element, 'pointerup', 102);

  expect([changes, ends]).toStrictEqual([[1.8, 1.6, 2.6], [3]]);
});

test('the drag stops at the bounds, and a disabled grip moves nothing', () => {
  const bounded = grip({ min: 1, max: 2 });
  pointer(bounded.element, 'pointerdown', 0);
  pointer(bounded.element, 'pointermove', 40);
  pointer(bounded.element, 'pointermove', -60);
  pointer(bounded.element, 'pointerup', -60);
  const off = grip({ disabled: true });
  pointer(off.element, 'pointerdown', 0);
  pointer(off.element, 'pointermove', 40);
  pointer(off.element, 'pointerup', 40);

  expect([bounded.changes, off.changes, off.ends]).toStrictEqual([
    [2, 1],
    [],
    [],
  ]);
});

test('a drag let go where it was pressed gives the number back exactly, however far it went and however the box rounds it', () => {
  const { element, changes } = grip({ value: 1.0752618984, step: 0.005 });
  pointer(element, 'pointerdown', 100);
  pointer(element, 'pointermove', 140);
  pointer(element, 'pointermove', 100);
  pointer(element, 'pointerup', 100);

  expect(changes).toStrictEqual([1.2752618984, 1.0752618984]);
});
