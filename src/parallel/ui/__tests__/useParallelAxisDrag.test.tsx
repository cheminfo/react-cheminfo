// @vitest-environment jsdom
/**
 * An axis moved by dragging its name, or by stepping it with the arrows.
 *
 * Three axes stand 300 pixels apart, at 0, 300 and 600 across the drawing
 * area. Each name is a real element hearing real events, so a drag is a press,
 * a move and a release, and what the hook shows between them is read off it.
 */

import { StrictMode, act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { parallelAxisLayouts } from '../../core/parallelAxes.ts';
import type { ParallelAxisDrag } from '../useParallelAxisDrag.ts';
import { useParallelAxisDrag } from '../useParallelAxisDrag.ts';

const LAYOUTS = parallelAxisLayouts(
  [
    { id: 'mw', label: 'MW', values: Float64Array.from([1, 2]) },
    { id: 'logP', label: 'logP', values: Float64Array.from([1, 2]) },
    { id: 'tpsa', label: 'TPSA', values: Float64Array.from([1, 2]) },
  ],
  2,
  600,
  200,
);

let host: HTMLDivElement;
let root: Root;
const seen: ParallelAxisDrag[] = [];
const orders: string[][] = [];

function Probe(props: { movable: boolean }) {
  const drag = useParallelAxisDrag({
    layouts: LAYOUTS,
    onAxisOrder: props.movable
      ? (ids) => {
          orders.push([...ids]);
        }
      : undefined,
  });
  seen.push(drag);
  return (
    <div>
      {LAYOUTS.map((layout, index) => (
        <span key={layout.id} {...drag.propsFor(index)}>
          {layout.label}
        </span>
      ))}
    </div>
  );
}

function latest(): ParallelAxisDrag {
  return seen.at(-1) as ParallelAxisDrag;
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  seen.length = 0;
  orders.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function mount(movable = true, strict = false): void {
  const probe = <Probe movable={movable} />;
  act(() => root.render(strict ? <StrictMode>{probe}</StrictMode> : probe));
  for (const name of host.querySelectorAll('span')) {
    name.setPointerCapture = () => undefined;
    name.releasePointerCapture = () => undefined;
  }
}

function name(index: number): HTMLElement {
  return host.querySelectorAll('span')[index] as HTMLElement;
}

function pointer(index: number, type: string, clientX: number, button = 0) {
  const event = new MouseEvent(type, { bubbles: true, clientX, button });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  act(() => {
    name(index).dispatchEvent(event);
  });
}

function press(index: number, key: string): boolean {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  });
  act(() => {
    name(index).dispatchEvent(event);
  });
  return event.defaultPrevented;
}

test('a name dragged over another axis shows where it would land, and moves there on release', () => {
  mount();
  pointer(0, 'pointerdown', 100);

  expect(latest().active).toStrictEqual({ from: 0, dx: 0, to: 0 });

  pointer(0, 'pointermove', 650);

  expect(latest().active).toStrictEqual({ from: 0, dx: 550, to: 2 });
  expect(orders).toStrictEqual([]);

  pointer(0, 'pointerup', 650);

  expect(orders).toStrictEqual([['logP', 'tpsa', 'mw']]);
  expect(latest().active).toBeNull();
});

test('a drop is reported once, even where React runs every state update twice', () => {
  mount(true, true);
  pointer(0, 'pointerdown', 100);
  pointer(0, 'pointermove', 650);
  pointer(0, 'pointerup', 650);

  expect(orders).toStrictEqual([['logP', 'tpsa', 'mw']]);
  expect(latest().active).toBeNull();
});

test('a name let go over its own place moves nothing', () => {
  mount();
  pointer(1, 'pointerdown', 300);
  pointer(1, 'pointermove', 380);
  pointer(1, 'pointerup', 380);

  expect(orders).toStrictEqual([]);
  expect(latest().active).toBeNull();
});

test('a move heard by another name leaves the drag where it was', () => {
  mount();
  pointer(2, 'pointerdown', 600);
  pointer(0, 'pointermove', 0);
  pointer(0, 'pointerup', 0);

  expect(latest().active).toBeNull();
  expect(orders).toStrictEqual([]);
});

test('a drag the browser takes away moves nothing', () => {
  mount();
  pointer(0, 'pointerdown', 0);
  pointer(0, 'pointermove', 600);
  pointer(0, 'pointercancel', 600);
  pointer(0, 'pointerup', 600);

  expect(latest().active).toBeNull();
  expect(orders).toStrictEqual([]);
});

test('only the main button picks a name up', () => {
  mount();
  pointer(0, 'pointerdown', 0, 2);

  expect(latest().active).toBeNull();
});

test('the arrows step an axis one place, and stop at either end', () => {
  mount();

  expect(press(0, 'ArrowRight')).toBe(true);
  expect(press(0, 'ArrowLeft')).toBe(true);
  expect(press(2, 'ArrowRight')).toBe(true);
  expect(press(2, 'ArrowLeft')).toBe(true);
  expect(press(1, 'Enter')).toBe(false);
  expect(orders).toStrictEqual([
    ['logP', 'mw', 'tpsa'],
    ['mw', 'tpsa', 'logP'],
  ]);
});

test('a figure whose order is fixed hands its names nothing to hold', () => {
  mount(false);
  pointer(0, 'pointerdown', 0);
  pointer(0, 'pointermove', 600);
  pointer(0, 'pointerup', 600);

  expect(press(0, 'ArrowRight')).toBe(false);
  expect(latest().enabled).toBe(false);
  expect(latest().active).toBeNull();
  expect(name(0).tabIndex).toBe(-1);
});
